package com.chukeles.app.modelo;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Email
    @NotBlank
    @Column(unique = true)
    private String email;

    @NotBlank
    @com.fasterxml.jackson.annotation.JsonIgnore
    private String contrasena;

    @NotBlank
    private String nombre;

    private String telefono;

    @Enumerated(EnumType.STRING)
    private Rol rol;

    private String fotoUrl;
}
