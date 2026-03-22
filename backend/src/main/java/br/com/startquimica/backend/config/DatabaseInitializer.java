package br.com.startquimica.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.net.URI;

/**
 * Garante que o banco de dados configurado exista antes do Flyway e do
 * Hibernate inicializarem. Implementa BeanFactoryPostProcessor para ser executado
 * antes da criação de qualquer bean de singleton (como DataSource, Flyway, etc).
 */
@Component
@Profile("!prod")
public class DatabaseInitializer implements BeanFactoryPostProcessor, EnvironmentAware {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInitializer.class);

    private Environment environment;

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        ensureDatabaseExists();
    }

    private void ensureDatabaseExists() {
        String jdbcUrl = environment.getProperty("spring.datasource.url");
        String username = environment.getProperty("spring.datasource.username");
        String password = environment.getProperty("spring.datasource.password");

        if (jdbcUrl == null) {
            log.warn("DatabaseInitializer: spring.datasource.url não definida. Pulando criação automática.");
            return;
        }

        // Extrai nome do banco e monta URL para o banco "postgres" (que sempre existe)
        String dbName = extractDatabaseName(jdbcUrl);
        String adminJdbcUrl = buildAdminUrl(jdbcUrl);

        if (dbName == null || adminJdbcUrl == null) {
            log.warn("DatabaseInitializer: não foi possível parsear a URL JDBC '{}'. Pulando criação automática.", jdbcUrl);
            return;
        }

        if (!dbName.matches("[a-zA-Z0-9_]+")) {
            log.error("DatabaseInitializer: nome do banco '{}' contém caracteres inválidos. Abortando.", dbName);
            return;
        }

        try (Connection conn = DriverManager.getConnection(adminJdbcUrl, username, password)) {
            if (!databaseExists(conn, dbName)) {
                log.info("Banco de dados '{}' não encontrado. Criando...", dbName);
                try (Statement stmt = conn.createStatement()) {
                    stmt.executeUpdate("CREATE DATABASE \"" + dbName + "\"");
                }
                log.info("Banco de dados '{}' criado com sucesso.", dbName);
            } else {
                log.debug("Banco de dados '{}' já existe.", dbName);
            }
        } catch (Exception e) {
            log.error("Falha ao verificar/criar o banco de dados '{}': {}", dbName, e.getMessage(), e);
            // Não lançamos exception para não travar o context se for erro de conexão/permissão,
            // mas o Spring travará logo em seguida ao tentar o banco real se ele não tiver sido criado.
        }
    }

    private boolean databaseExists(Connection conn, String dbName) throws Exception {
        try (PreparedStatement ps = conn.prepareStatement("SELECT 1 FROM pg_database WHERE datname = ?")) {
            ps.setString(1, dbName);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    private String extractDatabaseName(String jdbcUrl) {
        try {
            // Remove o prefixo "jdbc:" para usar URI
            URI uri = new URI(jdbcUrl.substring(5));
            String path = uri.getPath(); // "/cobranca"
            return (path != null && path.length() > 1) ? path.substring(1) : null;
        } catch (Exception e) {
            return null;
        }
    }

    private String buildAdminUrl(String jdbcUrl) {
        try {
            int lastSlashIndex = jdbcUrl.lastIndexOf('/');
            if (lastSlashIndex == -1) return null;
            return jdbcUrl.substring(0, lastSlashIndex + 1) + "postgres";
        } catch (Exception e) {
            return null;
        }
    }
}
