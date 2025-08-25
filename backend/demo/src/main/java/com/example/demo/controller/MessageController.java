package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Message;
import com.example.demo.service.LogService;
import com.example.demo.service.MessageService;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:5173")
public class MessageController {
    private final MessageService messageService;
    private final LogService logService;

    @Autowired
    public MessageController(MessageService messageService, LogService logService) {
        this.messageService = messageService;
        this.logService = logService;
    }

    // Yeni mesaj gönderme (ŞİFRELİ KAYIT)
    @PostMapping("/send")
    public ResponseEntity<Message> sendMessage(@RequestBody Message message) {
        Message savedMessage = messageService.saveMessage(message);
        logService.saveLog(message.getSenderEmail() + " kullanıcısının mesajı " + message.getReceiverEmail() + " kullanıcısına gönderildi.");
        return ResponseEntity.ok(savedMessage);
    }

    // Kullanıcının gelen kutusunu al (DEŞİFRELİ MESAJLAR)
    @GetMapping("/inbox/{email}")
    public ResponseEntity<List<Message>> getInboxMessages(@PathVariable String email) {
        List<Message> messages = messageService.getMessagesForUser(email);
        return ResponseEntity.ok(messages);
    }

    // Tüm mesajları al (DEŞİFRELİ MESAJLAR)
    @GetMapping
    public ResponseEntity<List<Message>> getAllMessages() {
        return ResponseEntity.ok(messageService.getAllMessages());
    }
}
