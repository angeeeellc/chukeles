package com.chukeles.app.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "market_listings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarketListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    @NotNull
    private Double price;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String photoUrl;

    @Enumerated(EnumType.STRING)
    @NotNull
    private MarketCategory category;

    @Builder.Default
    private String status = "AVAILABLE"; // AVAILABLE, SOLD

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
