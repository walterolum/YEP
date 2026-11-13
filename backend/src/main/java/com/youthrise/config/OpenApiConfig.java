package com.youthrise.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI youthRiseOpenApi() {
        SecurityScheme sessionCookie = new SecurityScheme()
                .type(SecurityScheme.Type.APIKEY)
                .in(SecurityScheme.In.COOKIE)
                .name("YOUTHRISE_SESSION");
        return new OpenAPI()
                .info(new Info()
                        .title("YouthRise API")
                        .version("1.0")
                        .description("""
                                Session-cookie API for the YouthRise platform. Mutating requests also require
                                the X-XSRF-TOKEN header whose value is read from the XSRF-TOKEN cookie.
                                """))
                .components(new Components().addSecuritySchemes("session", sessionCookie))
                .addSecurityItem(new SecurityRequirement().addList("session"));
    }
}
