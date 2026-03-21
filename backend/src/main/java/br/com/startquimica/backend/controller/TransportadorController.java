package br.com.startquimica.backend.controller;

import br.com.startquimica.backend.domain.Transportador;
import br.com.startquimica.backend.service.TransportadorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transportadores")
@RequiredArgsConstructor
public class TransportadorController {

    private final TransportadorService transportadorService;

    @GetMapping
    public List<Transportador> getAll() {
        return transportadorService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transportador> getById(@PathVariable Long id) {
        return ResponseEntity.ok(transportadorService.findById(id));
    }

    @PostMapping
    public Transportador create(@RequestBody Transportador transportador) {
        return transportadorService.save(transportador);
    }

    @PutMapping("/{id}")
    public Transportador update(@PathVariable Long id, @RequestBody Transportador transportador) {
        transportador.setId(id);
        return transportadorService.save(transportador);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        transportadorService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
