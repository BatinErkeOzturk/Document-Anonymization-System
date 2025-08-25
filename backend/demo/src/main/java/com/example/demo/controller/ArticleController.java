package com.example.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.model.Article;
import com.example.demo.model.Author;
import com.example.demo.model.Review;
import com.example.demo.repository.ArticleRepository;
import com.example.demo.repository.AuthorRepository;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.service.ArticleService;
import com.example.demo.service.LogService;
import com.example.demo.service.PdfNlpAnalyzerService;

@CrossOrigin(origins = "http://localhost:5173") // Frontend URL'nizi ekleyin
@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;
    private final ArticleRepository articleRepository;
    private final AuthorRepository authorRepository;
    private final LogService logService;
    private final ReviewRepository reviewRepository;

    @Autowired
    private PdfNlpAnalyzerService pdfNlpAnalyzerService;

    @Autowired
    public ArticleController(ArticleService articleService, ArticleRepository articleRepository,
            AuthorRepository authorRepository, LogService logService, ReviewRepository reviewRepository) {
        this.articleService = articleService;
        this.articleRepository = articleRepository;
        this.authorRepository = authorRepository;
        this.logService = logService;
        this.reviewRepository = reviewRepository;
    }

    @GetMapping("/author/{authorId}")
    public ResponseEntity<List<Article>> getArticlesByAuthor(@PathVariable UUID authorId) {
        List<Article> articles = articleRepository.findByAuthorId(authorId);
        return ResponseEntity.ok(articles);
    }

    @GetMapping
    public ResponseEntity<List<Article>> getAllArticles() {
        List<Article> articles = articleRepository.findAll();
        return ResponseEntity.ok(articles);
    }

    @GetMapping("/download/{trackingNumber}")
    public Map<String, String> downloadFile(@PathVariable String trackingNumber) {
        Map<String, String> response = new HashMap<>();
        try {
            String filePath = articleService.getFilePathByTrackingNumber(trackingNumber);

            String fullFilePath = "http://localhost:8080/" + filePath;

            response.put("filePath", fullFilePath);
        } catch (Exception e) {
            response.put("error", e.getMessage());
        }
        return response;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadArticle(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("authorId") String authorIdString
    ) {
        try {
            // UUID formatına çevir
            UUID authorId = UUID.fromString(authorIdString);

            // Dosya kaydet
            String filePath = articleService.saveFile(file);

            // Takip numarası oluştur
            String trackingNumber = UUID.randomUUID().toString();

            // Yazar bilgisini al
            Author author = authorRepository.findById(authorId)
                    .orElseThrow(() -> new RuntimeException("Yazar bulunamadı"));

            // Makale nesnesini oluştur ve kaydet
            Article article = new Article();
            article.setTitle(title);
            article.setFilePath(filePath);
            article.setTrackingNumber(trackingNumber);
            article.setStatus("SUBMITTED");
            article.setInterest_field("");
            article.setAuthor(author);

            articleRepository.save(article);

            logService.saveLog("Yeni makale yüklendi: " + title + " (ID: " + article.getId() + ")");

            return ResponseEntity.ok(article);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Geçersiz UUID formatı.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Makale yüklenirken hata oluştu.");
        }
    }

    @PostMapping("/assign-field")
    public ResponseEntity<?> assignFieldToArticle(@RequestBody Map<String, String> request) { // JSON olarak al
        try {
            String trackingNumber = request.get("trackingNumber"); // JSON içinden al
            Article article = articleRepository.findByTrackingNumber(trackingNumber);

            if (article == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Makale bulunamadı."));
            }

            // PDF dosya yolunu al
            String filePath = article.getFilePath();

            // NLP ile PDF içeriğini analiz ederek alanı belirle
            String detectedField = pdfNlpAnalyzerService.analyzePdfAndGetField(filePath);

            // Alanı güncelle
            article.setInterest_field(detectedField);
            articleRepository.save(article);

            logService.saveLog(
                    "Makale alanı atandı: " + "Makale Adı -> " + article.getTitle() + ", Alan -> " + detectedField);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Makale alanı başarıyla atandı: " + detectedField);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Makale alanı atanırken hata oluştu."));
        }
    }

    @PostMapping("/anonymize")
    public ResponseEntity<?> anonymizeArticle(@RequestBody Map<String, String> request) {
        try {
            String trackingNumber = request.get("trackingNumber");
            Article article = articleRepository.findByTrackingNumber(trackingNumber);

            if (article == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Makale bulunamadı."));
            }

            if (article.getStatus().equals("ACCEPTED") || article.getStatus().equals("UNDER_REVIEW") || article.getStatus().equals("REVIEWED") || article.getStatus().equals("COMPLETED")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Bu makale zaten anonimleştirilmiş."));
            }

            article.setStatus("ACCEPTED");
            articleRepository.save(article);

            // PDF dosya yolunu al
            String filePath = article.getFilePath();

            // FastAPI'ye anonimleştirme isteği gönderin
            String fastApiUrl = "http://localhost:8000/anonymize-pdf";
            Map<String, String> fastApiRequest = new HashMap<>();
            fastApiRequest.put("file_path", filePath);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.postForEntity(fastApiUrl, fastApiRequest, Map.class);

            // FastAPI'den gelen anonimleştirilmiş dosya yolunu al
            Map responseBody = response.getBody();
            String anonymizedFilePath = (String) responseBody.get("file_path");

            if (anonymizedFilePath == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "Anonimleştirme başarısız oldu."));
            }

            // Yeni anonimleştirilmiş makaleyi oluştur ve kaydet
            Article anonymizedArticle = new Article();
            anonymizedArticle.setTitle(article.getTitle() + " - Anonim");
            anonymizedArticle.setFilePath(anonymizedFilePath);
            anonymizedArticle.setTrackingNumber(UUID.randomUUID().toString());
            anonymizedArticle.setStatus("ANONYMIZED");
            anonymizedArticle.setInterest_field(article.getInterest_field());
            anonymizedArticle.setAuthor(article.getAuthor());

            articleRepository.save(anonymizedArticle);

            logService.saveLog(
                    "Makale anonimleştirildi: " + article.getTitle() + " (ID: " + anonymizedArticle.getId() + ")");

            Map<String, String> responseMap = new HashMap<>();
            responseMap.put("filePath", anonymizedFilePath);
            return ResponseEntity.ok(responseMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Makale anonimleştirilirken hata oluştu: " + e.getMessage()));
        }
    }

    @PutMapping("/{trackingNumber}")
    public ResponseEntity<?> updateArticle(
            @PathVariable String trackingNumber,
            @RequestBody Map<String, String> updates) {
        Article article = articleRepository.findByTrackingNumber(trackingNumber);

        if (article == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Makale bulunamadı."));
        }

        String anonymArticleString = article.getTitle() + " - Anonim";
        Article anonymArticle = articleRepository.findByTitle(anonymArticleString);

        if (updates.containsKey("status")) {
            article.setStatus(updates.get("status"));
            anonymArticle.setStatus(updates.get("status"));
        }

        logService.saveLog("Makale " + article.getTitle() + " yazara gönderildi!");

        articleRepository.save(article);
        articleRepository.save(anonymArticle);
        return ResponseEntity.ok(article);
    }

    @GetMapping("/get/{trackingNumber}")
    public ResponseEntity<?> getArticleByTrackingNumber(@PathVariable String trackingNumber) {
        Article article = articleRepository.findByTrackingNumber(trackingNumber);

        if (article == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Makale bulunamadı."));
        }

        Optional<Review> reviewOpt = reviewRepository.findByArticle_Id(article.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("article", article.getTitle());

        if (reviewOpt.isPresent()) {
            Review review = reviewOpt.get();
            response.put("reviewerComment", review.getComments());
            response.put("reviewerScore", review.getRating());
            response.put("status",article.getStatus());
        } else {
            response.put("reviewerComment", "Henüz değerlendirilmedi");
            response.put("reviewerScore", "N/A");
            response.put("status",article.getStatus());
        }

        return ResponseEntity.ok(response);
    }

}
