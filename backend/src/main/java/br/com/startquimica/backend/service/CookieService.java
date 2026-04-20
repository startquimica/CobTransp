package br.com.startquimica.backend.service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class CookieService {

    @Value("${app.jwt.cookie-name:jwt}")
    private String jwtCookieName;

    @Value("${app.jwt.expiration-in-ms:86400000}") // 24 hours
    private int jwtExpirationInMs;

    public void addJwtCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie(jwtCookieName, token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(jwtExpirationInMs / 1000);
        // cookie.setSecure(true); // Should be enabled in production (HTTPS)
        response.addCookie(cookie);
    }

    public void clearJwtCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(jwtCookieName, null);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
