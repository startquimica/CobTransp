package br.com.startquimica.backend.security;

import br.com.startquimica.backend.domain.Usuario;
import br.com.startquimica.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // O TenantContext pode estar ativo se o cliente enviou um JWT de sessão anterior.
        // A busca de usuário para autenticação nunca deve ser filtrada por tenant,
        // pois usuários ADMIN_TENANT não possuem tenant_id.
        Long savedTenantId = TenantContext.getCurrentTenant();
        TenantContext.clear();
        try {
            Usuario usuario = usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com email: " + email));
            return UserPrincipal.create(usuario);
        } finally {
            if (savedTenantId != null) {
                TenantContext.setCurrentTenant(savedTenantId);
            }
        }
    }
}
