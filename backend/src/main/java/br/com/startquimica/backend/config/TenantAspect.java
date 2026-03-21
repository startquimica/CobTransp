package br.com.startquimica.backend.config;

import br.com.startquimica.backend.security.TenantContext;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.hibernate.Session;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class TenantAspect {

    private final EntityManager entityManager;

    @Before("execution(* br.com.startquimica.backend.repository.*.*(..))")
    public void setTenantFilter() {
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId != null) {
            try {
                Session session = entityManager.unwrap(Session.class);
                session.enableFilter("tenantFilter").setParameter("tenantId", tenantId);
            } catch (Exception e) {
                log.warn("Não foi possível habilitar o filtro de tenant (tenantId={}): {}", tenantId, e.getMessage());
            }
        }
    }
}
