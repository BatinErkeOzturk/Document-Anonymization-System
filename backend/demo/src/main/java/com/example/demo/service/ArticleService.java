package com.example.demo.service;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.model.Article;
import com.example.demo.repository.ArticleRepository;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    public ArticleService(ArticleRepository articleRepository) {

        this.articleRepository = articleRepository;

        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));  
        } catch (IOException e) {
            e.printStackTrace();  
        }
    }

    public String getFilePathByTrackingNumber(String trackingNumber) {
        Article article = articleRepository.findByTrackingNumber(trackingNumber);
        if (article != null) {
            String filePath = article.getFilePath();   
            return filePath;
        } else {
            throw new RuntimeException("Takip numarasıyla makale bulunamadı: " + trackingNumber);
        }
    }        

    public String saveFile(MultipartFile file) throws IOException {
        // Dosya adını al
        String fileName = file.getOriginalFilename();
        if (fileName == null || fileName.isEmpty()) {
            throw new IOException("Geçersiz dosya adı.");
        }
    
        // Dosya kaydetme yolu (sunucuda bulunduğu yerin absolute path'ini alıyoruz)
        Path filePath = Paths.get(UPLOAD_DIR, fileName);
        file.transferTo(filePath.toFile());
    
        return "uploads/" + fileName;
    }
    
}
