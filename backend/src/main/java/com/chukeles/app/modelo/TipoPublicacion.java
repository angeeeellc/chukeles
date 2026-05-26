package com.chukeles.app.modelo;

/**
 * Tipos de publicación en el tablón de anuncios comunitario.
 *
 * DUDA  → El usuario tiene una pregunta o necesita consejo de la comunidad.
 * INFO  → El usuario comparte información útil con la comunidad.
 *
 * Las ventas van en el Mercado (/api/mercado).
 * Las quedadas van en Eventos (/api/eventos).
 */
public enum TipoPublicacion {
    DUDA,
    INFO
}
