package com.chukeles.app.configuracion;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Expone el directorio de uploads como recursos estáticos HTTP.
 * <p>
 * Cualquier petición a {@code /uploads/**} se resuelve contra
 * el directorio configurado en {@code chukeles.upload.ruta},
 * sin necesidad de copiar las imágenes dentro del JAR.
 * </p>
 */
@Configuration
public class ConfiguracionRecursosEstaticos implements WebMvcConfigurer {

    @Value("${chukeles.upload.ruta:./uploads}")
    private String rutaUpload;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String rutaAbsoluta = Paths.get(rutaUpload).toAbsolutePath().normalize().toUri().toString();

        // Garantizar que termine en "/"
        if (!rutaAbsoluta.endsWith("/")) {
            rutaAbsoluta = rutaAbsoluta + "/";
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(rutaAbsoluta);
    }
}
