package br.com.startquimica.backend.controller;

import br.com.startquimica.backend.domain.Tomador;
import br.com.startquimica.backend.service.TomadorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tomadores")
@RequiredArgsConstructor
public class TomadorController {

    private final TomadorService tomadorService;

    @GetMapping
    public List<Tomador> getAll() {
        return tomadorService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tomador> getById(@PathVariable Long id) {
        return ResponseEntity.ok(tomadorService.findById(id));
    }

    @PostMapping
    public Tomador create(@RequestBody Tomador tomador) {
        return tomadorService.save(tomador);
    }

    @PutMapping("/{id}")
    public Tomador update(@PathVariable Long id, @RequestBody Tomador tomador) {
        tomador.setId(id);
        return tomadorService.save(tomador);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tomadorService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
