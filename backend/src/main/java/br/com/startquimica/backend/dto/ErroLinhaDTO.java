package br.com.startquimica.backend.dto;

public record ErroLinhaDTO(
        int linha,
        String cnpjTomador,
        String ctrc,
        String motivo) {
}
