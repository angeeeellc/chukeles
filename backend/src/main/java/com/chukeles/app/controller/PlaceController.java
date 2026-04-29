package com.chukeles.app.controller;

import com.chukeles.app.model.Place;
import com.chukeles.app.repository.PlaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/places")
public class PlaceController {

    private final PlaceRepository placeRepository;

    @Autowired
    public PlaceController(PlaceRepository placeRepository) {
        this.placeRepository = placeRepository;
    }

    @GetMapping
    public List<Place> getAllPlaces() {
        return placeRepository.findAll();
    }

    @GetMapping("/{id}")
    public Place getPlaceById(@PathVariable Long id) {
        return placeRepository.findById(id).orElseThrow(() -> new RuntimeException("Lugar no encontrado"));
    }
}
