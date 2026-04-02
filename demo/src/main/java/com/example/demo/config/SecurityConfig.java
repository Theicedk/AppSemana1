package com.example.demo.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;


//Avisa que este será un archivo de configuracion de seguridad
@Configuration
//habilita la seguridad web de Spring, lo que nos permite configurar reglas de acceso y autenticación
@EnableWebSecurity
@EnableMethodSecurity // Permite usar @PreAuthorize en tus controladores
public class SecurityConfig {

    @Bean
    public JwtDecoder jwtDecoder(){
        return JwtDecoders.fromIssuerLocation("https://dev-ecmx143cjy36oshj.us.auth0.com/");
    }

    //Funcion encargada de interceptar cualquier http request y aplicar las reglas de seguridad configuradas en el método securityFilterChain
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) 
    throws Exception {
        http
        .csrf(csrf-> csrf.disable())
        .cors(cors -> cors.configurationSource(request ->{var config = new CorsConfiguration();
            config.setAllowedOrigins(List.of("http://localhost:5173"));
            config.setAllowedMethods(List.of("GET","POST","PUT","DELETE"));
            config.setAllowedHeaders(List.of("*"));
            return config; 
        }
    )).authorizeHttpRequests(auth-> auth.requestMatchers("/api/productos/**").permitAll().anyRequest().permitAll()
        ).oauth2ResourceServer(oath2 -> oath2.jwt(Customizer.withDefaults()));
        return http.build();
    }
}