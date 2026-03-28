package br.com.startquimica.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CobrancaExternaResponseDTO {

    private boolean success;
    private String protocolo;
    private String error;
    private Long cobrancaId;

    public static CobrancaExternaResponseDTO success(String protocolo, Long cobrancaId) {
        CobrancaExternaResponseDTO dto = new CobrancaExternaResponseDTO();
        dto.success = true;
        dto.protocolo = protocolo;
        dto.cobrancaId = cobrancaId;
        return dto;
    }

    public static CobrancaExternaResponseDTO error(String message) {
        CobrancaExternaResponseDTO dto = new CobrancaExternaResponseDTO();
        dto.success = false;
        dto.error = message;
        return dto;
    }
}
