package com.chukeles.app.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "places")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name;

    @Enumerated(EnumType.STRING)
    @NotNull
    private Category category;

    @NotBlank
    private String address;

    @NotNull
    private Double lat;

    @NotNull
    private Double lng;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String phone;
    private String website;
    private String photoUrl;

    @Builder.Default
    private Boolean approved = false;
}
