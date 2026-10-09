package com.technova.campusdesk.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.technova.campusdesk.entity.Ticket;
import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.Category;
import com.technova.campusdesk.entity.enums.Priority;
import com.technova.campusdesk.entity.enums.Role;
import com.technova.campusdesk.entity.enums.TicketStatus;
import com.technova.campusdesk.repository.CommentRepository;
import com.technova.campusdesk.repository.StatusHistoryRepository;
import com.technova.campusdesk.repository.TicketRepository;
import com.technova.campusdesk.repository.UserRepository;
import com.technova.campusdesk.security.JwtService;
import com.technova.campusdesk.security.UserPrincipal;

/**
 * Pruebas de la API de tickets de punta a punta, según docs/api-contract.md:
 * petición HTTP → JWT → seguridad → controller → service → repositorio → H2 (perfil test).
 * Dueño: Persona 4.
 *
 * No es @Transactional a propósito: así se detectan errores que solo aparecen fuera de una
 * transacción, como LazyInitializationException al mapear a DTO.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TicketApiIntegrationTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private JwtService jwtService;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private TicketRepository ticketRepository;

	@Autowired
	private CommentRepository commentRepository;

	@Autowired
	private StatusHistoryRepository statusHistoryRepository;

	private User admin;
	private User luis;
	private User carla;
	private User ana;
	private User pedro;

	private Ticket anaOpen;
	private Ticket anaAssignedToLuis;
	private Ticket pedroInProgressWithCarla;

	@BeforeEach
	void setUp() {
		commentRepository.deleteAll();
		statusHistoryRepository.deleteAll();
		ticketRepository.deleteAll();
		userRepository.deleteAll();

		admin = saveUser("Admin", "admin@technova.com", Role.ADMIN);
		luis = saveUser("Luis Gómez", "tech1@technova.com", Role.TECHNICIAN);
		carla = saveUser("Carla Ruiz", "tech2@technova.com", Role.TECHNICIAN);
		ana = saveUser("Ana Pérez", "ana@technova.com", Role.USER);
		pedro = saveUser("Pedro Díaz", "pedro@technova.com", Role.USER);

		anaOpen = saveTicket("No enciende el monitor", Category.HARDWARE, Priority.HIGH, TicketStatus.OPEN, ana, null);
		anaAssignedToLuis = saveTicket("Sin internet en el laboratorio", Category.NETWORK, Priority.CRITICAL,
				TicketStatus.ASSIGNED, ana, luis);
		pedroInProgressWithCarla = saveTicket("Error al abrir Office", Category.SOFTWARE, Priority.HIGH,
				TicketStatus.IN_PROGRESS, pedro, carla);
	}

	// ---------- GET /api/tickets ----------

	@Test
	void listWithoutTokenIs401() throws Exception {
		mockMvc.perform(get("/api/tickets")).andExpect(status().isUnauthorized());
	}

	@Test
	void adminSeesAllTickets() throws Exception {
		mockMvc.perform(as(admin, get("/api/tickets")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(3));
	}

	@Test
	void userSeesOnlyOwnTicketsWithNames() throws Exception {
		mockMvc.perform(as(ana, get("/api/tickets")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(2))
				.andExpect(jsonPath("$[*].requester.fullName", containsInAnyOrder("Ana Pérez", "Ana Pérez")));
	}

	@Test
	void technicianSeesOnlyAssignedTickets() throws Exception {
		mockMvc.perform(as(luis, get("/api/tickets")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(1))
				.andExpect(jsonPath("$[0].id").value(anaAssignedToLuis.getId()))
				.andExpect(jsonPath("$[0].technician.fullName").value("Luis Gómez"));
	}

	@Test
	void filtersCombineWithRoleVisibility() throws Exception {
		mockMvc.perform(as(admin, get("/api/tickets").param("priority", "HIGH")))
				.andExpect(jsonPath("$.length()").value(2));
		mockMvc.perform(as(admin, get("/api/tickets").param("priority", "HIGH").param("category", "SOFTWARE")))
				.andExpect(jsonPath("$.length()").value(1))
				.andExpect(jsonPath("$[0].id").value(pedroInProgressWithCarla.getId()));
		mockMvc.perform(as(ana, get("/api/tickets").param("status", "IN_PROGRESS")))
				.andExpect(jsonPath("$.length()").value(0));
	}

	@Test
	void invalidEnumFilterIs400() throws Exception {
		mockMvc.perform(as(admin, get("/api/tickets").param("status", "ABIERTA")))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400));
	}

	// ---------- GET /api/tickets/{id} ----------

	@Test
	void ownerAssignedTechnicianAndAdminCanSeeTicket() throws Exception {
		String path = "/api/tickets/" + anaAssignedToLuis.getId();
		for (User viewer : new User[] { ana, luis, admin }) {
			mockMvc.perform(as(viewer, get(path)))
					.andExpect(status().isOk())
					.andExpect(jsonPath("$.requester.fullName").value("Ana Pérez"))
					.andExpect(jsonPath("$.technician.fullName").value("Luis Gómez"))
					.andExpect(jsonPath("$.status").value("ASSIGNED"));
		}
	}

	@Test
	void otherUserAndUnassignedTechnicianGet403() throws Exception {
		String path = "/api/tickets/" + anaAssignedToLuis.getId();
		mockMvc.perform(as(pedro, get(path))).andExpect(status().isForbidden());
		mockMvc.perform(as(carla, get(path))).andExpect(status().isForbidden());
	}

	@Test
	void unknownTicketIs404() throws Exception {
		mockMvc.perform(as(admin, get("/api/tickets/999999")))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.status").value(404));
	}

	// ---------- POST /api/tickets ----------

	@Test
	@Disabled("Pendiente de P2: hoy responde 409 por REQUIRES_NEW en StatusHistoryService. La corrección está en DevNic.")
	void userCreatesOpenTicketWithCreationHistory() throws Exception {
		String body = ticketJson("Teclado sin respuesta", "El teclado del puesto 7 no responde", "HARDWARE", "MEDIUM");

		mockMvc.perform(as(ana, post("/api/tickets").contentType(MediaType.APPLICATION_JSON).content(body)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.status").value("OPEN"))
				.andExpect(jsonPath("$.requester.id").value(ana.getId()))
				.andExpect(jsonPath("$.technician").isEmpty())
				.andExpect(jsonPath("$.requester.password").doesNotExist());

		Ticket created = ticketRepository.findAll().stream()
				.filter(t -> t.getTitle().equals("Teclado sin respuesta"))
				.findFirst().orElseThrow();
		// Registro de creación: sin estado anterior, OPEN, hecho por quien lo creó.
		assertThat(statusHistoryRepository.findByTicketIdOrderByChangedAtAscIdAsc(created.getId()))
				.singleElement()
				.satisfies(h -> {
					assertThat(h.getPreviousStatus()).isNull();
					assertThat(h.getNewStatus()).isEqualTo(TicketStatus.OPEN);
					assertThat(h.getChangedBy().getId()).isEqualTo(ana.getId());
				});
	}

	@Test
	void invalidTicketIs400WithFieldErrors() throws Exception {
		String body = "{\"title\":\"\",\"description\":\"Sin título ni categoría\",\"priority\":\"LOW\"}";

		mockMvc.perform(as(ana, post("/api/tickets").contentType(MediaType.APPLICATION_JSON).content(body)))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.errors.title").exists())
				.andExpect(jsonPath("$.errors.category").exists());
	}

	@Test
	@Disabled("Pendiente de P2: la corrección está en DevNic (TECHNICIAN no crea tickets). Activar al fusionarla.")
	void technicianCannotCreateTicket() throws Exception {
		String body = ticketJson("Ticket del técnico", "Un técnico no debería poder crearlo", "OTHER", "LOW");

		mockMvc.perform(as(luis, post("/api/tickets").contentType(MediaType.APPLICATION_JSON).content(body)))
				.andExpect(status().isForbidden());
	}

	// ---------- PUT /api/tickets/{id} ----------

	@Test
	void ownerEditsOpenTicket() throws Exception {
		String body = ticketJson("Monitor del puesto 4 sin imagen", "Enciende pero no muestra imagen", "HARDWARE", "CRITICAL");

		mockMvc.perform(as(ana, put("/api/tickets/" + anaOpen.getId()).contentType(MediaType.APPLICATION_JSON).content(body)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.title").value("Monitor del puesto 4 sin imagen"))
				.andExpect(jsonPath("$.priority").value("CRITICAL"))
				.andExpect(jsonPath("$.status").value("OPEN"));
	}

	@Test
	void onlyOwnerCanEdit() throws Exception {
		String body = ticketJson("Cambio no autorizado", "Nadie más que Ana puede editarlo", "HARDWARE", "LOW");
		String path = "/api/tickets/" + anaOpen.getId();

		mockMvc.perform(as(pedro, put(path).contentType(MediaType.APPLICATION_JSON).content(body)))
				.andExpect(status().isForbidden());
		mockMvc.perform(as(admin, put(path).contentType(MediaType.APPLICATION_JSON).content(body)))
				.andExpect(status().isForbidden());
	}

	@Test
	void assignedTicketCannotBeEdited() throws Exception {
		String body = ticketJson("Ya asignado", "Un ticket asignado no se puede editar", "NETWORK", "LOW");

		mockMvc.perform(as(ana, put("/api/tickets/" + anaAssignedToLuis.getId())
				.contentType(MediaType.APPLICATION_JSON).content(body)))
				.andExpect(status().isConflict());
	}

	// ---------- utilidades ----------

	private MockHttpServletRequestBuilder as(User user, MockHttpServletRequestBuilder request) {
		return request.header("Authorization", "Bearer " + jwtService.generateToken(new UserPrincipal(user)));
	}

	private User saveUser(String fullName, String email, Role role) {
		return userRepository.save(User.builder()
				.fullName(fullName)
				.email(email)
				.password("$2a$10$hashDePruebaNoEsUnaContrasenaReal")
				.role(role)
				.build());
	}

	private Ticket saveTicket(String title, Category category, Priority priority, TicketStatus status,
			User requester, User technician) {
		return ticketRepository.save(Ticket.builder()
				.title(title)
				.description("Descripción de prueba: " + title)
				.category(category)
				.priority(priority)
				.status(status)
				.requester(requester)
				.technician(technician)
				.build());
	}

	private static String ticketJson(String title, String description, String category, String priority) {
		return """
				{"title":"%s","description":"%s","category":"%s","priority":"%s"}"""
				.formatted(title, description, category, priority);
	}

}
