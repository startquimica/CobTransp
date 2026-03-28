package br.com.startquimica.backend.controller;

import br.com.startquimica.backend.dto.CobrancaExternaRequestDTO;
import br.com.startquimica.backend.dto.CobrancaExternaResponseDTO;
import br.com.startquimica.backend.service.CobrancaExternaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api-externa")
@RequiredArgsConstructor
public class CobrancaExternaController {

    private final CobrancaExternaService cobrancaExternaService;

    @PostMapping("/cobrancas")
    public ResponseEntity<CobrancaExternaResponseDTO> criarCobranca(
            @RequestHeader(value = "X-API-Key", required = false) String apiKey,
            @RequestBody CobrancaExternaRequestDTO request) {

        if (apiKey == null || apiKey.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(CobrancaExternaResponseDTO.error("Header X-API-Key é obrigatório"));
        }

        CobrancaExternaResponseDTO response = cobrancaExternaService.processar(apiKey, request);

        if (!response.isSuccess()) {
            if (response.getError() != null && response.getError().contains("inválida")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(response);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
