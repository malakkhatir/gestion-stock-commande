<?php
$data = json_encode(['code' => 'TEST123', 'libelle' => 'Ville Post']);
$opts = ['http' => ['method' => 'POST', 'header' => 'Content-Type: application/json', 'content' => $data]];
$context = stream_context_create($opts);
echo file_get_contents('http://127.0.0.1:8000/api/v1/villes', false, $context);
