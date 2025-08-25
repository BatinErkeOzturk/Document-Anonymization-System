package com.example.demo.service;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import opennlp.tools.tokenize.SimpleTokenizer;

@Service
public class PdfNlpAnalyzerService {

    private static final Map<String, String[]> FIELD_KEYWORDS = new HashMap<>() {
        {
            put("Derin Öğrenme",
                    new String[] { "neural networks", "deep learning", "artificial intelligence", "backpropagation",
                            "activation functions", "CNN", "transformers", "self-attention", "LSTM", "gradient descent",
                            "regularization", "dropout", "autoencoders", "GANs", "supervised learning",
                            "unsupervised learning", "self-supervised learning", "contrastive learning", "fine-tuning",
                            "foundation models", "LoRA" });

            put("Doğal Dil İşleme",
                    new String[] { "text processing", "tokenization", "stemming", "lemmatization", "POS tagging", "NER",
                            "sentiment analysis", "text classification", "NLU", "NLG", "machine translation",
                            "word embeddings", "word2vec", "BERT", "GPT", "transformer models", "seq2seq",
                            "syntactic parsing", "speech recognition", "large language models", "RAG",
                            "instruction tuning", "affective computing" });

            put("Bilgisayarla Görü",
                    new String[] { "image processing", "object detection", "image classification", "feature extraction",
                            "OCR", "face recognition", "YOLO", "OpenCV", "image segmentation", "pose estimation", "CNN",
                            "video processing", "pattern recognition", "Diffusion Models", "stable diffusion", "NeRF",
                            "3D reconstruction", "SLAM", "multi-view geometry", "augmented reality vision" });

            put("Generatif Yapay Zeka",
                    new String[] { "GANs", "VAE", "diffusion models", "stable diffusion", "DALL-E", "text-to-image",
                            "CLIP", "image synthesis", "AI storytelling", "multimodal AI", "AI-based animation",
                            "voice synthesis", "deepfake", "neural style transfer", "few-shot generation",
                            "AI music generation", "video generation" });

            put("Beyin-Bilgisayar Arayüzleri",
                    new String[] { "EEG", "BCI", "emotion recognition", "SEED", "FTT", "CWT", "brain signal processing",
                            "motor imagery", "neurofeedback", "brainwave classification", "non-invasive BCI",
                            "invasive BCI", "neural decoding", "brain-computer communication", "emotion dataset",
                            "DEAP dataset", "DENS", "EEG Data", "Band power", "FFT" });

            put("Kullanıcı Deneyimi Tasarımı",
                    new String[] { "usability testing", "HCI", "wireframing", "design thinking", "user research",
                            "interaction design", "accessibility", "UX writing", "A/B testing", "cognitive load",
                            "heuristic evaluation", "microinteractions", "emotional design", "behavioral UX",
                            "dark patterns", "neuroscience in UX", "inclusive design" });

            put("Artırılmış ve Sanal Gerçeklik",
                    new String[] { "VR", "AR", "MR", "spatial computing", "haptics", "hand tracking",
                            "virtual environments", "real-time rendering", "stereoscopic vision", "SLAM for AR",
                            "gesture recognition", "occlusion handling", "3D UI design", "AI in AR/VR" });

            put("Veri Madenciliği",
                    new String[] { "association rule mining", "clustering", "decision trees", "anomaly detection",
                            "feature selection", "dimensionality reduction", "classification models",
                            "Bayesian networks", "big data analytics", "time series mining", "text mining",
                            "predictive modeling", "autoML", "graph mining" });

            put("Veri Görselleştirme",
                    new String[] { "data dashboards", "interactive visualization", "geospatial visualization", "D3.js",
                            "Power BI", "Tableau", "real-time visualization", "Sankey diagrams", "treemaps", "heatmaps",
                            "network graphs", "data storytelling" });

            put("Veri İşleme Sistemleri",
                    new String[] { "Apache Spark", "Hadoop", "MapReduce", "stream processing", "Kafka", "Flink",
                            "distributed computing", "real-time data pipelines", "batch processing",
                            "cloud data processing", "edge computing", "serverless data processing" });

            put("Zaman Serisi Analizi",
                    new String[] { "ARIMA", "LSTM for time series", "Kalman filter", "time series forecasting",
                            "seasonal decomposition", "dynamic time warping", "multivariate time series",
                            "Fourier transform", "stationarity tests", "anomaly detection in time series",
                            "LSTM Network" });

            put("Şifreleme Algoritmaları",
                    new String[] { "symmetric encryption", "asymmetric encryption", "AES", "RSA", "ECC", "SHA-256",
                            "homomorphic encryption", "post-quantum cryptography", "zero-knowledge proofs",
                            "TLS encryption", "blockchain security" });

            put("Güvenli Yazılım Geliştirme",
                    new String[] { "secure coding", "OWASP Top 10", "SQL injection", "XSS", "CSRF",
                            "secure API development", "DevSecOps", "penetration testing", "JWT security", "RBAC",
                            "security patch management", "threat modeling" });

            put("Ağ Güvenliği",
                    new String[] { "firewall", "IDS", "IPS", "VPN", "zero-trust architecture", "network segmentation",
                            "DDoS mitigation", "honeypots", "network forensics", "secure network protocols",
                            "802.1X authentication" });

            put("Kimlik Doğrulama Sistemleri",
                    new String[] { "MFA", "SSO", "OAuth 2.0", "biometric authentication", "password hashing", "TOTP",
                            "RBAC", "certificate-based authentication", "adaptive authentication",
                            "behavioral biometrics" });

            put("Adli Bilişim",
                    new String[] { "digital forensics", "chain of custody", "forensic imaging",
                            "steganography detection", "malware forensics", "log analysis", "dark web investigation",
                            "memory forensics", "court-admissible evidence" });

            put("5G ve Yeni Nesil Ağlar", new String[] { "mmWave", "massive MIMO", "network slicing", "URRLC",
                    "beamforming", "Open RAN", "5G security", "quantum networking", "energy-efficient networking" });

            put("Bulut Bilişim", new String[] { "hybrid cloud", "multi-cloud", "serverless computing", "Kubernetes",
                    "container security", "cloud-native applications", "API gateways", "edge cloud computing" });

            put("Blockchain Teknolojisi", new String[] { "distributed ledger", "smart contracts", "Ethereum", "Bitcoin",
                    "PoW", "PoS", "DeFi", "NFTs", "zero-knowledge proofs", "blockchain oracles", "sharding" });

            put("P2P ve Merkeziyetsiz Sistemler",
                    new String[] { "peer-to-peer networking", "decentralized storage", "IPFS",
                            "smart contract execution", "mesh networking", "self-sovereign identity", "Web3",
                            "permissionless networks" });
        }
    };

    public String analyzePdfAndGetField(String filePath) throws IOException {
        File file = new File(filePath);
        if (!file.exists()) {
            throw new IOException("Dosya bulunamadı: " + filePath);
        }

        try (PDDocument document = PDDocument.load(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document).toLowerCase(); // Küçük harfe çeviriyoruz.

            // Tokenizer ile kelimeleri ayırıyoruz.
            SimpleTokenizer tokenizer = SimpleTokenizer.INSTANCE;
            String[] tokens = tokenizer.tokenize(text);
            Set<String> uniqueTokens = new HashSet<>(Arrays.asList(tokens)); // Tekrarları önlemek için küme
                                                                             // kullanıyoruz.

            // Hangi alanın geçtiğini kontrol ediyoruz
            Map<String, Integer> fieldScores = new HashMap<>();
            for (Map.Entry<String, String[]> entry : FIELD_KEYWORDS.entrySet()) {
                String field = entry.getKey();
                String[] keywords = entry.getValue();

                // Anahtar kelimelerden kaç farklı tanesi geçtiğini sayuyoruz
                int count = 0;
                for (String keyword : keywords) {
                    if (uniqueTokens.contains(keyword.toLowerCase())) {
                        count++;
                    }
                }
                fieldScores.put(field, count);
            }

            // En yüksek puana sahip alanı seçiyoruz
            return fieldScores.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .filter(entry -> entry.getValue() > 0)
                    .map(Map.Entry::getKey)
                    .orElse("Genel"); // Hiçbir kategoriye uymazsa "Genel" olarak atıyoruz
        }
    }

}
