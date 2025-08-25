package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.model.Log;
import com.example.demo.repository.LogRepository;

@Service
public class LogService {
    private final LogRepository logRepository;

    public LogService(LogRepository logRepository) {
        this.logRepository = logRepository;
    }

    public List<Log> getAllLogs() {
        return logRepository.findAll();
    }

    public void saveLog(String content) {
        Log log = new Log(content);
        logRepository.save(log);
    }
}
