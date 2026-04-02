package br.com.startquimica.backend.importacao;

import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Component
public class CsvArquivoParser implements ArquivoParser {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    public FormatoArquivo getFormato() {
        return FormatoArquivo.CSV;
    }

    @Override
    public List<LinhaArquivo> parse(InputStream input) throws IOException {
        List<LinhaArquivo> linhas = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {
            String line;
            int lineNumber = 0;
            boolean dataStarted = false;

            while ((line = reader.readLine()) != null) {
                lineNumber++;
                String[] cols = line.split(";", -1);
                if (cols.length < 15) continue;

                String cnpjRaw = normalizarCnpj(cols[0]);
                if (!dataStarted) {
                    if (cnpjRaw.matches("\\d{11,14}")) {
                        dataStarted = true;
                    } else {
                        continue;
                    }
                }

                linhas.add(new LinhaArquivo(
                        lineNumber,
                        cnpjRaw,
                        cols[1].trim(),
                        cols[2].trim(),
                        parseDate(cols[3].trim()),
                        parseDate(cols[4].trim()),
                        parseBigDecimal(cols[5].trim()),
                        parseBigDecimal(cols[6].trim()),
                        parseBigDecimal(cols[7].trim()),
                        parseBigDecimal(cols[8].trim()),
                        cols[9].trim(),
                        normalizarCnpj(cols[10]),
                        cols[11].trim(),
                        cols[12].trim(),
                        parseDate(cols[13].trim()),
                        cols[14].trim()
                ));
            }
        }
        return linhas;
    }

    private static String normalizarCnpj(String raw) {
        return raw.replaceAll("[.\\-/]", "").trim();
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
            // Brazilian format: "1.234,56" → "1234.56"
            String normalized = s.replace(".", "").replace(",", ".");
            return new BigDecimal(normalized);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }
}
