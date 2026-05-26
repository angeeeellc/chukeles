package com.chukeles.app.modelo;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "publicaciones_tablon")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicacionTablon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String titulo;

    @NotBlank
    @Column(columnDefinition = "TEXT")
    private String contenido;

    /** Tipo de publicación: DUDA o INFO (las ventas van en el Mercado) */
    @Enumerated(EnumType.STRING)
    @NotNull
    @Builder.Default
    private TipoPublicacion tipo = TipoPublicacion.INFO;

    /** URL de la foto adjunta (opcional) */
    private String fotoUrl;

    private String infoContacto;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private Usuario usuario;

    private LocalDateTime creadoEn;

    @PrePersist
    protected void onCreate() {
        creadoEn = LocalDateTime.now();
    }
}
