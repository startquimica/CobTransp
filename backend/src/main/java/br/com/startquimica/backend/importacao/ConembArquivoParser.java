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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Parser para arquivos no formato CONEMB (Conhecimento de Embarque).
 *
 * Estrutura do arquivo:
 *   320 - Header do arquivo
 *   321 - Header transportador (CNPJ + nome)
 *   322 - Detalhe do CT-e (data emissão, chave, série)
 *   323 - Trailer transportador
 *   351 - Header fatura
 *   352 - Resumo fatura (data vencimento)
 *   353 - Detalhe fatura por CT-e (número + valor)
 *   354 - Detalhe NF por CT-e (NF, data, CNPJ tomador, ordem de carga)
 *   355 - Trailer fatura
 */
@Component
public class ConembArquivoParser implements ArquivoParser {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("ddMMyyyy");

    @Override
    public FormatoArquivo getFormato() {
        return FormatoArquivo.CONEMB;
    }

    @Override
    public List<LinhaArquivo> parse(InputStream input) throws IOException {
        List<String> allLines = readAllLines(input);

        // 1. Extrair CNPJ transportador do registro 321
        String cnpjTransportador = "";
        for (String line : allLines) {
            if (line.startsWith("321") && line.length() >= 17) {
                cnpjTransportador = extract(line, 3, 14).replaceAll("[.\\-/]", "");
                break;
            }
        }

        // 2. Construir mapa de detalhes CT-e dos registros 322 (indexado por número CT-e)
        Map<String, Registro322> mapaCte = new LinkedHashMap<>();
        for (String line : allLines) {
            if (line.startsWith("322") && line.length() >= 38) {
                String ctrc = extract(line, 18, 12);
                LocalDate dataEmissao = parseDate(extract(line, 30, 8));
                String serie = extract(line, 13, 1);
                String chaveCte = line.length() >= 724 ? extract(line, 680, 44) : "";
                mapaCte.put(ctrc, new Registro322(dataEmissao, serie, chaveCte));
            }
        }

        // 3. Extrair data de vencimento do registro 352
        LocalDate dataVencimento = null;
        for (String line : allLines) {
            if (line.startsWith("352") && line.length() >= 43) {
                dataVencimento = parseDate(extract(line, 35, 8));
                break;
            }
        }

        // 4. Processar pares 353→354 para montar LinhaArquivo
        List<LinhaArquivo> resultado = new ArrayList<>();
        int lineNumber = 0;
        String ctrcAtual = null;
        String serieAtual = null;
        BigDecimal valorAtual = BigDecimal.ZERO;

        for (String line : allLines) {
            lineNumber++;

            if (line.startsWith("353") && line.length() >= 45) {
                // Registro 353: detalhe fatura por CT-e
                ctrcAtual = extract(line, 18, 12);
                serieAtual = extract(line, 13, 1);
                valorAtual = parseCentavos(extract(line, 30, 15));

            } else if (line.startsWith("354") && line.length() >= 58 && ctrcAtual != null) {
                // Registro 354: detalhe NF vinculada ao CT-e corrente
                String nrNf = extract(line, 6, 8);
                LocalDate dataNf = parseDate(extract(line, 14, 8));
                String cnpjTomador = extract(line, 44, 14).replaceAll("[.\\-/]", "");
                String ordemCarga = extract(line, 66, 9);

                // Buscar dados complementares do registro 322
                Registro322 detalhe322 = mapaCte.get(ctrcAtual);
                LocalDate dataEmissao = detalhe322 != null ? detalhe322.dataEmissao : null;
                String serie = detalhe322 != null && !detalhe322.serie.isEmpty()
                        ? detalhe322.serie : serieAtual;
                String chaveCte = detalhe322 != null ? detalhe322.chaveCte : "";

                resultado.add(new LinhaArquivo(
                        lineNumber,
                        cnpjTransportador,
                        ctrcAtual,
                        serie,
                        dataEmissao,
                        dataVencimento,
                        valorAtual,
                        BigDecimal.ZERO,  // baseCalculoIcms
                        BigDecimal.ZERO,  // aliquotaIcms
                        BigDecimal.ZERO,  // valorIcms
                        chaveCte,
                        cnpjTomador,
                        nrNf,
                        "",               // serieNf - não disponível no CONEMB
                        dataNf,           // dataEntrega (data da NF como proxy)
                        ordemCarga
                ));
            }
        }

        return resultado;
    }

    private static List<String> readAllLines(InputStream input) throws IOException {
        List<String> lines = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (!line.isBlank()) {
                    lines.add(line);
                }
            }
        }
        return lines;
    }

    private static String extract(String line, int start, int length) {
        if (start >= line.length()) return "";
        int end = Math.min(start + length, line.length());
        return line.substring(start, end).trim();
    }

    private static LocalDate parseDate(String s) {
        if (s == null || s.isBlank() || s.equals("00000000")) return null;
        try {
            return LocalDate.parse(s, DATE_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }

    private static BigDecimal parseCentavos(String s) {
        if (s == null || s.isBlank()) return BigDecimal.ZERO;
        try {
            return new BigDecimal(s).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private record Registro322(LocalDate dataEmissao, String serie, String chaveCte) {}
}
