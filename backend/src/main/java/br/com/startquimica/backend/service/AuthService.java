package br.com.startquimica.backend.service;

import br.com.startquimica.backend.domain.Usuario;
import br.com.startquimica.backend.dto.ForgotPasswordRequest;
import br.com.startquimica.backend.dto.LoginRequest;
import br.com.startquimica.backend.repository.UsuarioRepository;
import br.com.startquimica.backend.security.JwtTokenProvider;
import br.com.startquimica.backend.security.UserPrincipal;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UsuarioRepository usuarioRepository;
    private final JavaMailSender mailSender;
    private final CookieService cookieService;

    @Value("${app.mail.from:noreply@startquimica.com.br}")
    private String mailFrom;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    public UserPrincipal authenticateUser(LoginRequest loginRequest, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        cookieService.addJwtCookie(response, jwt);

        return (UserPrincipal) authentication.getPrincipal();
    }

    public void logout(HttpServletResponse response) {
        cookieService.clearJwtCookie(response);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        // Always return success to avoid user enumeration - only log internally
        usuarioRepository.findByEmail(request.getEmail()).ifPresent(usuario -> {
            String token = UUID.randomUUID().toString();
            usuario.setPasswordResetToken(token);
            usuario.setPasswordResetTokenExpiry(LocalDateTime.now().plusHours(1));
            usuarioRepository.save(usuario);

            sendPasswordResetEmail(usuario, token);
        });
    }

    private void sendPasswordResetEmail(Usuario usuario, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(usuario.getEmail());
            message.setSubject("Redefinição de senha");
            message.setText(
                    "Olá, " + usuario.getNome() + "!\n\n" +
                    "Recebemos uma solicitação para redefinir a senha da sua conta.\n" +
                    "Clique no link abaixo para criar uma nova senha (válido por 1 hora):\n\n" +
                    resetLink + "\n\n" +
                    "Se você não solicitou a redefinição de senha, ignore este e-mail.\n\n" +
                    "Atenciosamente,\nEquipe Start Química"
            );
            mailSender.send(message);
            log.info("E-mail de redefinição de senha enviado para: {}", usuario.getEmail());
        } catch (Exception e) {
            log.error("Falha ao enviar e-mail de redefinição de senha para {}: {}", usuario.getEmail(), e.getMessage());
        }
    }
}
