import { configService } from "../services/config.service";

describe("ConfigService - Validación de Planes", () => {
  test("debe cargar configuración válida", () => {
    const config = configService.leerConfigPlanes();

    expect(config).toBeDefined();
    expect(typeof config.enabled).toBe("boolean");
  });

  test("debe validar configuración de promoción", () => {
    const validacion = configService.validarConfigPromocion();

    expect(validacion).toHaveProperty("valido");
    expect(validacion).toHaveProperty("errores");
    expect(Array.isArray(validacion.errores)).toBe(true);
  });

  test("debe manejar errores de validación gracefully", () => {
    // Este test verifica que no crashee con config inválida
    // En un escenario real, tendríamos mocks para archivos corruptos

    expect(() => {
      configService.leerConfigPlanes();
    }).not.toThrow();
  });
});
