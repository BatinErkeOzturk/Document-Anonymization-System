package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.model.AESUtil;
import com.example.demo.model.Message;
import com.example.demo.repository.MessageRepository;

@Service
public class MessageService {
    private final MessageRepository messageRepository;

    @Autowired
    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    // Yeni mesaj kaydet (ŞİFRELİ)
    public Message saveMessage(Message message) {
        try {
            String encryptedContent = AESUtil.encrypt(message.getContent());
            message.setContent(encryptedContent);
            return messageRepository.save(message);
        } catch (Exception e) {
            throw new RuntimeException("Mesaj şifrelenirken hata oluştu", e);
        }
    }

    // Tüm mesajları getir (DEŞİFRELİ)
    public List<Message> getAllMessages() {
        return messageRepository.findAll().stream()
                .map(this::decryptMessage)
                .collect(Collectors.toList());
    }

    // Kullanıcıya gelen mesajları getir (DEŞİFRELİ)
    public List<Message> getMessagesForUser(String receiverEmail) {
        return messageRepository.findByReceiverEmail(receiverEmail).stream()
                .map(this::decryptMessage)
                .collect(Collectors.toList());
    }

    // Şifre çözme işlemi
    private Message decryptMessage(Message message) {
        try {
            String decryptedContent = AESUtil.decrypt(message.getContent());
            message.setContent(decryptedContent);
        } catch (Exception e) {
            throw new RuntimeException("Mesajın şifresi çözülemedi", e);
        }
        return message;
    }
}
