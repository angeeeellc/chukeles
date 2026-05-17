package com.chukeles.app.configuracion;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de Swagger/OpenAPI.
 * Accesible en: http://localhost:8080/swagger-ui.html
 */
@Configuration
public class ConfiguracionSwagger {

    @Bean
    public OpenAPI openApiChukeles() {
        return new OpenAPI()
                .info(new Info()
                        .title("Chukeles API")
                        .description("API REST para la app de lugares pet-friendly de A Coruña")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Chukeles Team")
                                .email("info@chukeles.es")))
                .components(new Components()
                        .addSecuritySchemes("Bearer", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Introduce el token JWT sin el prefijo 'Bearer '")));
    }
}
