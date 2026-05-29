package com.chukeles.app.modelo;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "anuncios_mercado")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnuncioMercado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String titulo;

    @NotNull
    private Double precio;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private String fotoUrl;

    @Enumerated(EnumType.STRING)
    @NotNull
    private CategoriaMercado categoria;

    @Builder.Default
    private String estado = "DISPONIBLE"; // DISPONIBLE, VENDIDO

    private String infoContacto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Usuario usuario;

    private LocalDateTime creadoEn;

    @PrePersist
    protected void onCreate() {
        creadoEn = LocalDateTime.now();
    }
}
