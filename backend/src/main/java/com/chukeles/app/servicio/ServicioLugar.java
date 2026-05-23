package com.chukeles.app.servicio;

import com.chukeles.app.transferencia.PeticionLugar;
import com.chukeles.app.excepcion.RecursoNoEncontradoException;
import com.chukeles.app.modelo.Categoria;
import com.chukeles.app.modelo.Lugar;
import com.chukeles.app.repositorio.RepositorioLugar;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de lugares.
 * Contiene la lógica de búsqueda con filtros combinados y distancia Haversine.
 */
@Service
@RequiredArgsConstructor
public class ServicioLugar {

    private final RepositorioLugar repositorioLugar;

    /**
     * Busca lugares con filtros opcionales combinados.
     * Si se proporciona lat/lng/radio, filtra por distancia Haversine en memoria.
     *
     * @param nombre    Parte del nombre (puede ser null)
     * @param categoria Categoría exacta (puede ser null)
     * @param lat       Latitud del usuario (puede ser null)
     * @param lng       Longitud del usuario (puede ser null)
     * @param radioKm   Radio de búsqueda en km (puede ser null)
     * @return Lista de lugares que cumplen todos los filtros activos
     */
    public List<Lugar> buscarConFiltros(String nombre, Categoria categoria, Double lat, Double lng, Double radioKm) {
        List<Lugar> resultados;

        boolean tieneNombre = nombre != null && !nombre.isBlank();
        boolean tieneCategoria = categoria != null;

        if (tieneNombre && tieneCategoria) {
            resultados = repositorioLugar.findByCategoriaAndNombreContainingIgnoreCase(categoria, nombre);
        } else if (tieneNombre) {
            resultados = repositorioLugar.findByNombreContainingIgnoreCase(nombre);
        } else if (tieneCategoria) {
            resultados = repositorioLugar.findByCategoria(categoria);
        } else {
            resultados = repositorioLugar.findAll();
        }

        // Filtro de distancia Haversine (si se proporcionan coordenadas y radio)
        if (lat != null && lng != null && radioKm != null) {
            final double radio = radioKm;
            resultados = resultados.stream()
                    .filter(lugar -> calcularDistanciaKm(lat, lng, lugar.getLat(), lugar.getLng()) <= radio)
                    .collect(Collectors.toList());
        }

        return resultados;
    }

    public Lugar obtenerPorId(Long id) {
        return repositorioLugar.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Lugar no encontrado con id: " + id));
    }

    public Lugar crear(PeticionLugar peticion) {
        Lugar lugar = Lugar.builder()
                .nombre(peticion.getNombre())
                .categoria(peticion.getCategoria())
                .direccion(peticion.getDireccion())
                .lat(peticion.getLat())
                .lng(peticion.getLng())
                .descripcion(peticion.getDescripcion())
                .telefono(peticion.getTelefono())
                .sitioWeb(peticion.getSitioWeb())
                .fotoUrl(peticion.getFotoUrl())
                .aprobado(peticion.getAprobado() != null ? peticion.getAprobado() : false)
                .build();
        return repositorioLugar.save(lugar);
    }

    public Lugar editar(Long id, PeticionLugar peticion) {
        Lugar lugar = obtenerPorId(id);
        lugar.setNombre(peticion.getNombre());
        lugar.setCategoria(peticion.getCategoria());
        lugar.setDireccion(peticion.getDireccion());
        lugar.setLat(peticion.getLat());
        lugar.setLng(peticion.getLng());
        lugar.setDescripcion(peticion.getDescripcion());
        lugar.setTelefono(peticion.getTelefono());
        lugar.setSitioWeb(peticion.getSitioWeb());
        if (peticion.getFotoUrl() != null) lugar.setFotoUrl(peticion.getFotoUrl());
        if (peticion.getAprobado() != null) lugar.setAprobado(peticion.getAprobado());
        return repositorioLugar.save(lugar);
    }

    public void eliminar(Long id) {
        if (!repositorioLugar.existsById(id)) {
            throw new RecursoNoEncontradoException("Lugar no encontrado con id: " + id);
        }
        repositorioLugar.deleteById(id);
    }

    /**
     * Actualiza únicamente la URL de foto de un lugar.
     * Llamado por ControladorFotos tras guardar el fichero en disco.
     *
     * @param id     ID del lugar
     * @param fotoUrl URL relativa pública, ej: /uploads/lugar_42_uuid.jpg
     * @return El lugar actualizado
     */
    public Lugar actualizarFoto(Long id, String fotoUrl) {
        Lugar lugar = obtenerPorId(id);
        lugar.setFotoUrl(fotoUrl);
        return repositorioLugar.save(lugar);
    }

    /**
     * Fórmula Haversine para calcular la distancia entre dos puntos geográficos en km.
     */
    private double calcularDistanciaKm(double lat1, double lng1, double lat2, double lng2) {
        final double RADIO_TIERRA_KM = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return RADIO_TIERRA_KM * c;
    }
}
