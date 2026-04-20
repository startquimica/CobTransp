package br.com.startquimica.backend.controller;

import br.com.startquimica.backend.dto.ForgotPasswordRequest;
import br.com.startquimica.backend.dto.LoginRequest;
import br.com.startquimica.backend.dto.UserDto;
import br.com.startquimica.backend.security.UserPrincipal;
import br.com.startquimica.backend.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<UserDto> authenticateUser(@Valid @RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        UserPrincipal userPrincipal = authService.authenticateUser(loginRequest, response);
        return ResponseEntity.ok(new UserDto(userPrincipal));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        authService.logout(response);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(new UserDto(userPrincipal));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok().build();
    }
}
