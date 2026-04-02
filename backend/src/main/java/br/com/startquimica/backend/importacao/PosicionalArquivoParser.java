package br.com.startquimica.backend.importacao;

import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Component
public class PosicionalArquivoParser implements ArquivoParser {

    // Minimum line length to contain all fields: 173 (ordemCarga start) + 10 (ordemCarga size) = 183
    private static final int TAMANHO_MINIMO = 171;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("ddMMyyyy");

    @Override
    public FormatoArquivo getFormato() {
        return FormatoArquivo.POSICIONAL;
    }

    @Override
    public List<LinhaArquivo> parse(InputStream input) throws IOException {
        List<LinhaArquivo> linhas = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {
            String line;
            int lineNumber = 0;
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.isBlank() || line.length() < TAMANHO_MINIMO) continue;

                linhas.add(new LinhaArquivo(
                        lineNumber,
                        extract(line, 0, 14).replaceAll("[.\\-/]", ""),
                        extract(line, 14, 8),
                        extract(line, 22, 3),
                        parseDate(extract(line, 25, 8)),
                        parseDate(extract(line, 33, 8)),
                        parseBigDecimal(extract(line, 42, 13)).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP),
                        parseBigDecimal(extract(line, 54, 13)).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP),
                        parseBigDecimal(extract(line, 67, 5)).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP),
                        parseBigDecimal(extract(line, 72, 13)).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP),
                        extract(line, 85, 44),
                        extract(line, 129, 14).replaceAll("[.\\-/]", ""),
                        extract(line, 143, 9),
                        extract(line, 151, 3),
                        parseDate(extract(line, 154, 8)),
                        extract(line, 162, 9)
                ));
            }
        }
        return linhas;
    }

    private static String extract(String line, int start, int length) {
        if (start >= line.length()) return "";
        int end = Math.min(start + length, line.length());
        return line.substring(start, end).trim();
    }

    private static LocalDate parseDate(String s) {
        if (s == null || s.isBlank()) return null;
        try {
            return LocalDate.parse(s, DATE_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }

    private static BigDecimal parseBigDecimal(String s) {
        if (s == null || s.isBlank()) return BigDecimal.ZERO;
        try {
            String normalized = s.replace(",", ".");
            return new BigDecimal(normalized);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }
}
