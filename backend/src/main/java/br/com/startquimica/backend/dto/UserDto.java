package br.com.startquimica.backend.dto;

import br.com.startquimica.backend.security.UserPrincipal;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String nome;
    private String email;
    private String role;
    private Long tenantId;

    public UserDto(UserPrincipal userPrincipal) {
        this.id = userPrincipal.getId();
        this.nome = userPrincipal.getUsername();
        this.email = userPrincipal.getEmail();
        this.role = userPrincipal.getAuthorities().iterator().next().getAuthority();
        this.tenantId = userPrincipal.getTenantId();
    }
}
