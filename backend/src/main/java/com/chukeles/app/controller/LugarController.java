package com.chukeles.app.controller;

import com.chukeles.app.model.Lugar;
import com.chukeles.app.repository.LugarRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lugares")
public class LugarController {

    private final LugarRepository placeRepository;

    @Autowired
    public LugarController(LugarRepository placeRepository) {
        this.placeRepository = placeRepository;
    }

    @GetMapping
    public List<Lugar> getAllPlaces() {
        return placeRepository.findAll();
    }

    @GetMapping("/{id}")
    public Lugar getPlaceById(@PathVariable Long id) {
        return placeRepository.findById(id).orElseThrow(() -> new RuntimeException("Lugar no encontrado"));
    }
}
