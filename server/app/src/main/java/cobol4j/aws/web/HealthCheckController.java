
package cobol4j.aws.web;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/health_check")
public class HealthCheckController {
    @GetMapping
    public HealthCheckRecord healthCheck() {
        return new HealthCheckRecord("OK");
    }
}
