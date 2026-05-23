package com.chukeles.app.configuracion;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Value("classpath:data.sql")
    private Resource dataScript;

    @Override
    public void run(String... args) throws Exception {
        try {
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM lugares", Integer.class);
            if (count != null && count == 0) {
                logger.info("La base de datos está vacía. Ejecutando data.sql para insertar datos iniciales...");
                String sql = new String(dataScript.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
                // Removemos el TRUNCATE TABLE para evitar problemas en H2 si lo usamos más adelante, aunque aquí la BD está vacía
                sql = sql.replaceAll("(?i)TRUNCATE TABLE [a-zA-Z0-9_]+;", "");
                jdbcTemplate.execute(sql);
                logger.info("Datos iniciales insertados correctamente.");
            } else {
                logger.info("La base de datos ya contiene {} lugares. Se omite la ejecución de data.sql.", count);
            }
        } catch (Exception e) {
            logger.error("Error al verificar o inicializar la base de datos: {}", e.getMessage());
        }
    }
}
