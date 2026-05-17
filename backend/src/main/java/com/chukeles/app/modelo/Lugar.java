package com.chukeles.app.modelo;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "lugares")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lugar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @NotNull
    private Categoria categoria;

    @NotBlank
    private String direccion;

    @NotNull
    private Double lat;

    @NotNull
    private Double lng;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private String telefono;
    private String sitioWeb;
    private String fotoUrl;

    @Builder.Default
    private Boolean aprobado = false;
}
