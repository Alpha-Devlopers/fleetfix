package com.fleetfix.backend.controller;

import com.fleetfix.backend.dto.common.ApiResponse;
import com.fleetfix.backend.dto.common.PageResponse;
import com.fleetfix.backend.dto.diagnostic.DiagnosticRequest;
import com.fleetfix.backend.dto.diagnostic.DiagnosticResponse;
import com.fleetfix.backend.service.DiagnosticService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/diagnostics")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
@Tag(name = "Diagnostics", description = "Diagnostic Trouble Code (DTC) endpoints. DTCs are supplied by the frontend; no AI processing occurs here.")
public class DiagnosticController {

    private final DiagnosticService diagnosticService;

    @PostMapping
    @Operation(summary = "Receive and store a diagnostic trouble code (DTC) record")
    public ResponseEntity<ApiResponse<DiagnosticResponse>> createDiagnostic(@Valid @RequestBody DiagnosticRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Diagnostic event recorded", diagnosticService.createDiagnostic(request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a diagnostic event by id")
    public ResponseEntity<ApiResponse<DiagnosticResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(diagnosticService.getById(id)));
    }

    @GetMapping("/vehicle/{vehicleId}")
    @Operation(summary = "Get diagnostic history for a vehicle")
    public ResponseEntity<ApiResponse<PageResponse<DiagnosticResponse>>> getHistoryByVehicle(
            @PathVariable Long vehicleId,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(PageResponse.from(diagnosticService.getHistoryByVehicle(vehicleId, pageable))));
    }
}
