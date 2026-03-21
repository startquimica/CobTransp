package br.com.startquimica.backend.service;

import br.com.startquimica.backend.domain.Usuario;
import br.com.startquimica.backend.repository.UsuarioRepository;
import br.com.startquimica.backend.security.TenantContext;
import br.com.startquimica.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }

    public Usuario findById(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    @Transactional
    public Usuario save(Usuario usuario) {
        if (usuario.getTenantId() == null) {
            usuario.setTenantId(TenantContext.getCurrentTenant());
        }

        // Restrição: Somente ADMIN_TENANT pode criar outro ADMIN_TENANT
        if ("ADMIN_TENANT".equals(usuario.getRole())) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isCurrentAdmin = auth != null && auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN_TENANT"));

            if (!isCurrentAdmin) {
                throw new RuntimeException("Somente administradores gerais podem criar ou atualizar usuários para este perfil.");
            }
        }
        
        // Validation: Only ADMIN_TENANT can have no tenant_id
        if (!"ADMIN_TENANT".equals(usuario.getRole()) && usuario.getTenantId() == null) {
            throw new RuntimeException("Usuário com perfil " + usuario.getRole() + " deve estar vinculado a uma tenant");
        }
        
        // Encode password if it's new or changed
        if (usuario.getSenha() != null && !usuario.getSenha().matches("\\$2[aby]\\$.*")) {
            usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        }
        
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void deleteById(Long id) {
        usuarioRepository.deleteById(id);
    }

    @Transactional
    public void alterarMinhaSenha(String senhaAtual, String novaSenha) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();

        Usuario usuario = usuarioRepository.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!passwordEncoder.matches(senhaAtual, usuario.getSenha())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha atual incorreta");
        }

        if (novaSenha == null || novaSenha.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A nova senha deve ter no mínimo 6 caracteres");
        }

        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);
    }
}
