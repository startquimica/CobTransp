package br.com.startquimica.backend.controller;

import br.com.startquimica.backend.domain.Cobranca;
import br.com.startquimica.backend.dto.ImportacaoArquivoResultDTO;
import br.com.startquimica.backend.importacao.FormatoArquivo;
import br.com.startquimica.backend.service.CobrancaService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping("/cobrancas")
@RequiredArgsConstructor
public class CobrancaController {

    private final CobrancaService cobrancaService;

    @GetMapping
    public Page<Cobranca> getAll(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String tipoCobranca,
            @RequestParam(required = false) String tipoTransporte,
            @RequestParam(required = false) String transportador,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate alteracaoDe,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate alteracaoAte,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate envioDe,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate envioAte) {

        return cobrancaService.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id")),
                status, tipoCobranca, tipoTransporte, transportador,
                alteracaoDe, alteracaoAte, envioDe, envioAte);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cobranca> getById(@PathVariable Long id) {
        return ResponseEntity.ok(cobrancaService.findById(id));
    }

    @PostMapping
    public Cobranca create(@RequestBody Cobranca cobranca) {
        return cobrancaService.save(cobranca);
    }

    @PutMapping("/{id}")
    public Cobranca update(@PathVariable Long id, @RequestBody Cobranca cobranca) {
        cobranca.setId(id);
        return cobrancaService.save(cobranca);
    }

    @PostMapping("/{id}/enviar")
    @PreAuthorize("hasAnyRole('ADMIN_TENANT', 'GERENTE', 'OPERADOR')")
    public ResponseEntity<Cobranca> enviar(@PathVariable Long id) {
        return ResponseEntity.ok(cobrancaService.enviarParaSankhya(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        cobrancaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/importar-arquivo")
    @PreAuthorize("hasAnyRole('GERENTE','OPERADOR')")
    public ResponseEntity<ImportacaoArquivoResultDTO> importarArquivo(
            @RequestParam MultipartFile file,
            @RequestParam FormatoArquivo formato,
            @RequestParam String tipoCobranca,
            @RequestParam String tipoTransporte,
            @RequestParam String tipoDocumento) throws IOException {
        return ResponseEntity.ok(
                cobrancaService.importarArquivo(file, formato, tipoCobranca, tipoTransporte, tipoDocumento));
    }
}

