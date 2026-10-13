<?php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/db.php";
require_once __DIR__ . "/auth.php";

const VENUE_STATUSES = ["Available", "Unavailable"];

function sendVenueJson(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

function readVenueJson(): array
{
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);

    if (!is_array($data)) {
        sendVenueJson(400, [
            "success" => false,
            "message" => "Request body must be valid JSON."
        ]);
    }

    return $data;
}

function findVenue(PDO $conn, int $id): ?array
{
    $stmt = $conn->prepare(
        "SELECT venue_id, venue_name, location, capacity, status, created_at, updated_at
         FROM venues
         WHERE venue_id = ?"
    );

    $stmt->execute([$id]);
    $venue = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$venue) {
        return null;
    }

    $venue["venue_id"] = (int) $venue["venue_id"];
    $venue["capacity"] = (int) $venue["capacity"];

    return $venue;
}

function validateVenue(array $data): array
{
    $errors = [];

    $name = trim((string) ($data["venue_name"] ?? ""));
    $location = trim((string) ($data["location"] ?? ""));
    $capacity = filter_var(
        $data["capacity"] ?? null,
        FILTER_VALIDATE_INT,
        ["options" => ["min_range" => 1]]
    );
    $status = $data["status"] ?? "Available";

    if ($name === "") {
        $errors["venue_name"] = "Venue name is required.";
    } elseif (mb_strlen($name) > 100) {
        $errors["venue_name"] = "Venue name must not exceed 100 characters.";
    }

    if ($location === "") {
        $errors["location"] = "Location is required.";
    } elseif (mb_strlen($location) > 255) {
        $errors["location"] = "Location must not exceed 255 characters.";
    }

    if ($capacity === false) {
        $errors["capacity"] = "Capacity must be a whole number greater than 0.";
    }

    if (!in_array($status, VENUE_STATUSES, true)) {
        $errors["status"] = "Status must be Available or Unavailable.";
    }

    return [
        "errors" => $errors,
        "clean" => [
            "venue_name" => $name,
            "location" => $location,
            "capacity" => $capacity === false ? 0 : (int) $capacity,
            "status" => $status
        ]
    ];
}

function venueExists(
    PDO $conn,
    string $name,
    string $location,
    ?int $excludeId = null
): bool {
    $sql = "SELECT COUNT(*) FROM venues WHERE venue_name = ? AND location = ?";
    $params = [$name, $location];

    if ($excludeId !== null) {
        $sql .= " AND venue_id != ?";
        $params[] = $excludeId;
    }

    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    return (int) $stmt->fetchColumn() > 0;
}

$currentUser = authenticateUser();
$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {

    requireRole($currentUser, [
        "Administrator",
        "Organiser",
        "Staff",
        "Customer"
    ]);

    if (isset($_GET["id"])) {

        $id = filter_var(
            $_GET["id"],
            FILTER_VALIDATE_INT,
            ["options" => ["min_range" => 1]]
        );

        if ($id === false) {
            sendVenueJson(400, [
                "success" => false,
                "message" => "Venue ID must be a positive integer."
            ]);
        }

        $venue = findVenue($conn, $id);

        if (!$venue) {
            sendVenueJson(404, [
                "success" => false,
                "message" => "Venue not found."
            ]);
        }

        sendVenueJson(200, [
            "success" => true,
            "data" => $venue
        ]);
    }

    $page = filter_var(
        $_GET["page"] ?? 1,
        FILTER_VALIDATE_INT,
        ["options" => ["min_range" => 1]]
    );

    $limit = filter_var(
        $_GET["limit"] ?? 10,
        FILTER_VALIDATE_INT,
        ["options" => ["min_range" => 1, "max_range" => 100]]
    );

    if ($page === false || $limit === false) {
        sendVenueJson(400, [
            "success" => false,
            "message" => "page must be at least 1 and limit must be between 1 and 100."
        ]);
    }

    $where = [];
    $params = [];

    $search = trim((string) ($_GET["search"] ?? ""));
    $status = trim((string) ($_GET["status"] ?? ""));
    $minCapacity = trim((string) ($_GET["min_capacity"] ?? ""));

    if ($search !== "") {
        $where[] = "(venue_name LIKE ? OR location LIKE ?)";
        $params[] = "%{$search}%";
        $params[] = "%{$search}%";
    }

    if ($status !== "") {
        if (!in_array($status, VENUE_STATUSES, true)) {
            sendVenueJson(400, [
                "success" => false,
                "message" => "Status must be Available or Unavailable."
            ]);
        }

        $where[] = "status = ?";
        $params[] = $status;
    }

    if ($minCapacity !== "") {
        $capacityValue = filter_var(
            $minCapacity,
            FILTER_VALIDATE_INT,
            ["options" => ["min_range" => 1]]
        );

        if ($capacityValue === false) {
            sendVenueJson(400, [
                "success" => false,
                "message" => "Minimum capacity must be a positive integer."
            ]);
        }

        $where[] = "capacity >= ?";
        $params[] = $capacityValue;
    }

    $whereSql = $where
        ? "WHERE " . implode(" AND ", $where)
        : "";

    $countStmt = $conn->prepare(
        "SELECT COUNT(*) FROM venues {$whereSql}"
    );
    $countStmt->execute($params);

    $total = (int) $countStmt->fetchColumn();
    $offset = ($page - 1) * $limit;

    $stmt = $conn->prepare(
        "SELECT venue_id, venue_name, location, capacity, status, created_at, updated_at
         FROM venues
         {$whereSql}
         ORDER BY venue_name ASC, venue_id ASC
         LIMIT {$limit} OFFSET {$offset}"
    );

    $stmt->execute($params);
    $venues = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($venues as &$venue) {
        $venue["venue_id"] = (int) $venue["venue_id"];
        $venue["capacity"] = (int) $venue["capacity"];
    }

    sendVenueJson(200, [
        "success" => true,
        "data" => $venues,
        "pagination" => [
            "page" => (int) $page,
            "limit" => (int) $limit,
            "total" => $total,
            "totalPages" => (int) ceil($total / $limit)
        ]
    ]);
}

requireRole($currentUser, ["Administrator"]);

if ($method === "POST") {

    $data = readVenueJson();
    $validated = validateVenue($data);

    if (!empty($validated["errors"])) {
        sendVenueJson(400, [
            "success" => false,
            "message" => "Validation failed.",
            "errors" => $validated["errors"]
        ]);
    }

    $venue = $validated["clean"];

    if (venueExists(
        $conn,
        $venue["venue_name"],
        $venue["location"]
    )) {
        sendVenueJson(409, [
            "success" => false,
            "message" => "A venue with this name already exists at this location."
        ]);
    }

    $stmt = $conn->prepare(
        "INSERT INTO venues
         (venue_name, location, capacity, status)
         VALUES (?, ?, ?, ?)"
    );

    $stmt->execute([
        $venue["venue_name"],
        $venue["location"],
        $venue["capacity"],
        $venue["status"]
    ]);

    $id = (int) $conn->lastInsertId();

    sendVenueJson(201, [
        "success" => true,
        "message" => "Venue created successfully.",
        "data" => findVenue($conn, $id)
    ]);
}

if ($method === "PUT") {

    $id = filter_var(
        $_GET["id"] ?? null,
        FILTER_VALIDATE_INT,
        ["options" => ["min_range" => 1]]
    );

    if ($id === false || $id === null) {
        sendVenueJson(400, [
            "success" => false,
            "message" => "Venue ID is required."
        ]);
    }

    $existing = findVenue($conn, $id);

    if (!$existing) {
        sendVenueJson(404, [
            "success" => false,
            "message" => "Venue not found."
        ]);
    }

    $data = readVenueJson();
    $validated = validateVenue($data);

    if (!empty($validated["errors"])) {
        sendVenueJson(400, [
            "success" => false,
            "message" => "Validation failed.",
            "errors" => $validated["errors"]
        ]);
    }

    $venue = $validated["clean"];

    if (venueExists(
        $conn,
        $venue["venue_name"],
        $venue["location"],
        $id
    )) {
        sendVenueJson(409, [
            "success" => false,
            "message" => "A venue with this name already exists at this location."
        ]);
    }

    $stmt = $conn->prepare(
        "UPDATE venues
         SET venue_name = ?,
             location = ?,
             capacity = ?,
             status = ?
         WHERE venue_id = ?"
    );

    $stmt->execute([
        $venue["venue_name"],
        $venue["location"],
        $venue["capacity"],
        $venue["status"],
        $id
    ]);

    sendVenueJson(200, [
        "success" => true,
        "message" => "Venue updated successfully.",
        "data" => findVenue($conn, $id)
    ]);
}

if ($method === "DELETE") {

    $id = filter_var(
        $_GET["id"] ?? null,
        FILTER_VALIDATE_INT,
        ["options" => ["min_range" => 1]]
    );

    if ($id === false || $id === null) {
        sendVenueJson(400, [
            "success" => false,
            "message" => "Venue ID is required."
        ]);
    }

    if (!findVenue($conn, $id)) {
        sendVenueJson(404, [
            "success" => false,
            "message" => "Venue not found."
        ]);
    }

    $check = $conn->prepare(
        "SELECT COUNT(*)
         FROM events
         WHERE venue_id = ?"
    );

    $check->execute([$id]);

    if ((int) $check->fetchColumn() > 0) {
        sendVenueJson(409, [
            "success" => false,
            "message" => "Cannot delete this venue because events are assigned to it."
        ]);
    }

    $stmt = $conn->prepare(
        "DELETE FROM venues
         WHERE venue_id = ?"
    );

    $stmt->execute([$id]);

    sendVenueJson(200, [
        "success" => true,
        "message" => "Venue deleted successfully."
    ]);
}

header("Allow: GET, POST, PUT, DELETE");

sendVenueJson(405, [
    "success" => false,
    "message" => "Method not allowed."
]);
