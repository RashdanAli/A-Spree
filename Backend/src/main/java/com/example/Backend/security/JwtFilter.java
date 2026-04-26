package com.example.Backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String email = null;
        String jwt = null;

        // Check if header exists and starts with "Bearer "
        if (authorizationHeader == null) {
            System.out.println("[JwtFilter] No Authorization header found");
        } else if (!authorizationHeader.startsWith("Bearer ")) {
            System.out
                    .println("[JwtFilter] Authorization header does not start with 'Bearer ': " + authorizationHeader);
        } else {
            jwt = authorizationHeader.substring(7);
            try {
                email = jwtUtil.extractEmail(jwt);
                System.out.println("[JwtFilter] Token parsed successfully, email: " + email);
            } catch (Exception e) {
                System.out.println(
                        "[JwtFilter] Token parsing failed: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            }
        }

        // If we found an email and the user isn't already authenticated in this context
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            boolean valid = jwtUtil.validateToken(jwt, email);
            System.out.println("[JwtFilter] validateToken result for " + email + ": " + valid);
            if (valid) {
                // 1. Extract the role string from the token claims
                String role = jwtUtil.extractClaim(jwt, claims -> claims.get("role", String.class));

                // 2. Convert it to a Spring Authority (Spring usually expects "ROLE_" prefix)
                org.springframework.security.core.authority.SimpleGrantedAuthority authority = new org.springframework.security.core.authority.SimpleGrantedAuthority(
                        "ROLE_" + role);

                // 3. Create the auth token with the authority list
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        email, null, java.util.Collections.singletonList(authority));

                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Spring Security 6+: must set a new context object, not mutate the existing
                // one
                org.springframework.security.core.context.SecurityContext context = SecurityContextHolder
                        .createEmptyContext();
                context.setAuthentication(auth);
                SecurityContextHolder.setContext(context);
            }
        }
        filterChain.doFilter(request, response);
    }
}