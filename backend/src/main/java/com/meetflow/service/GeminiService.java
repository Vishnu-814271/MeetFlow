package com.meetflow.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GeminiService {

    @Value("${gemini.api.key:${GEMINI_API_KEY:${GOOGLE_API_KEY:}}}")
    private String apiKey;

    public String generateEventConfig(String prompt) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return generateLocalFallback(prompt);
        }

        try {
            String systemInstruction = "You are MeetFlow Event Architect. The user will describe an event in plain English. " +
                    "Your job is to design the event architecture and return a strict JSON configuration. " +
                    "Do not return any markdown formatting, no ```json blocks, just raw JSON text. " +
                    "The JSON must have the following keys:\n" +
                    "- eventName: String (name of the event)\n" +
                    "- eventType: String (ALUMNI, CONFERENCE, HACKATHON, WEDDING, SOCIAL, CORPORATE, EDUCATION, NGO, SPORTS, TRAVEL, or GENERAL)\n" +
                    "- description: String (short summary based on user prompt)\n" +
                    "- featuresConfig: Object with booleans: travel, carpool, announcements, chat, gallery, polls, attendance\n" +
                    "- registrationSchema: Array of field objects. Each field object must have: name (String camelCase), label (String), type (text, number, or select), placeholder (String), required (boolean), and optional options (array of strings if type is select)\n" +
                    "- rolesSchema: Array of strings representing required participant roles (e.g., organizer, participant, driver, mentor, judge, speaker, sponsor, guest)\n" +
                    "- dashboardSchema: Array of strings representing dashboard widgets (e.g., total_registered, confirmed, maybe, not_attending, pending_responses, reached_venue, en_route, checked_in, speakers, sponsors, cars, rooms, budget)\n\n" +
                    "Example JSON format:\n" +
                    "{\n" +
                    "  \"eventName\": \"AI Hackathon 2026\",\n" +
                    "  \"eventType\": \"HACKATHON\",\n" +
                    "  \"description\": \"A coding marathon for developers\",\n" +
                    "  \"featuresConfig\": {\"travel\":false, \"carpool\":false, \"announcements\":true, \"chat\":true, \"gallery\":true, \"polls\":true, \"attendance\":true},\n" +
                    "  \"registrationSchema\": [\n" +
                    "    {\"name\":\"gitHubUrl\", \"label\":\"GitHub Profile\", \"type\":\"text\", \"placeholder\":\"https://github.com/...\", \"required\":true},\n" +
                    "    {\"name\":\"skills\", \"label\":\"Programming Skills\", \"type\":\"text\", \"placeholder\":\"e.g. React, Java\", \"required\":false}\n" +
                    "  ],\n" +
                    "  \"rolesSchema\": [\"organizer\", \"participant\", \"mentor\", \"judge\"],\n" +
                    "  \"dashboardSchema\": [\"total_registered\", \"confirmed\", \"checked_in\"]\n" +
                    "}";

            String requestBody = "{\n" +
                    "  \"contents\": [\n" +
                    "    {\n" +
                    "      \"parts\": [\n" +
                    "        { \"text\": \"" + escapeJson(prompt) + "\" }\n" +
                    "      ]\n" +
                    "    }\n" +
                    "  ],\n" +
                    "  \"systemInstruction\": {\n" +
                    "    \"parts\": [\n" +
                    "      { \"text\": \"" + escapeJson(systemInstruction) + "\" }\n" +
                    "    ]\n" +
                    "  },\n" +
                    "  \"generationConfig\": {\n" +
                    "    \"responseMimeType\": \"application/json\"\n" +
                    "  }\n" +
                    "}";

            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(10))
                    .build();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .timeout(Duration.ofSeconds(15))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                return parseGeminiResponse(response.body());
            } else {
                System.err.println("Gemini API call failed with status: " + response.statusCode() + ", body: " + response.body());
                return generateLocalFallback(prompt);
            }

        } catch (Exception e) {
            System.err.println("Exception calling Gemini API: " + e.getMessage());
            return generateLocalFallback(prompt);
        }
    }

    private String parseGeminiResponse(String responseBody) {
        try {
            // Find text field in standard Gemini response structure: candidates[0].content.parts[0].text
            // Simple regex match to extract the text block
            Pattern pattern = Pattern.compile("\"text\"\\s*:\\s*\"([^\"]*)\"");
            Matcher matcher = pattern.matcher(responseBody);
            if (matcher.find()) {
                // Unescape JSON string
                String rawText = matcher.group(1);
                rawText = rawText.replace("\\n", "\n")
                        .replace("\\\"", "\"")
                        .replace("\\\\", "\\");
                return rawText;
            }
            // If regex fails, check for standard JSON block
            if (responseBody.contains("candidates")) {
                int firstTextIdx = responseBody.indexOf("\"text\"");
                if (firstTextIdx != -1) {
                    int startQuote = responseBody.indexOf("\"", firstTextIdx + 6);
                    int endQuote = responseBody.indexOf("\"", startQuote + 1);
                    while (responseBody.charAt(endQuote - 1) == '\\') {
                        endQuote = responseBody.indexOf("\"", endQuote + 1);
                    }
                    String rawText = responseBody.substring(startQuote + 1, endQuote);
                    return rawText.replace("\\n", "\n")
                            .replace("\\\"", "\"")
                            .replace("\\\\", "\\");
                }
            }
            return responseBody;
        } catch (Exception e) {
            return responseBody;
        }
    }

    private String generateLocalFallback(String prompt) {
        String lowerPrompt = prompt.toLowerCase();
        
        String eventName = "My Configured Event";
        Pattern namePattern = Pattern.compile("(?:create|setup|new)\\s+(?:a|an)?\\s*([a-zA-Z0-9\\s\\-]{3,40})(?:\\s+in|\\s+for|\\s+with|\\s+at)?");
        Matcher nameMatcher = namePattern.matcher(prompt);
        if (nameMatcher.find()) {
            eventName = nameMatcher.group(1).trim();
            // Capitalize first letters
            String[] words = eventName.split("\\s+");
            StringBuilder sb = new StringBuilder();
            for (String w : words) {
                if (!w.isEmpty()) {
                    sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1)).append(" ");
                }
            }
            eventName = sb.toString().trim();
        }

        String eventType = "GENERAL";
        String description = "An event custom-tailored by MeetFlow.";
        boolean travel = true;
        boolean carpool = true;
        boolean announcements = true;
        boolean chat = true;
        boolean gallery = true;
        boolean polls = true;
        boolean attendance = true;

        String regSchema = "[]";
        String rolesSchema = "[\"organizer\", \"participant\"]";
        String dashboardSchema = "[\"total_registered\", \"confirmed\", \"maybe\", \"not_attending\"]";

        if (lowerPrompt.contains("hackathon") || lowerPrompt.contains("coding") || lowerPrompt.contains("programming")) {
            eventType = "HACKATHON";
            description = "A collaborative coding marathon where participants build innovative projects.";
            travel = false;
            carpool = false;
            regSchema = "[\n" +
                    "  {\"name\":\"collegeName\", \"label\":\"College / University\", \"type\":\"text\", \"placeholder\":\"e.g. IIT Hyderabad\", \"required\":true},\n" +
                    "  {\"name\":\"gitHubUrl\", \"label\":\"GitHub Profile\", \"type\":\"text\", \"placeholder\":\"https://github.com/username\", \"required\":false},\n" +
                    "  {\"name\":\"skills\", \"label\":\"Programming Languages\", \"type\":\"text\", \"placeholder\":\"e.g. React, Java, Python\", \"required\":false},\n" +
                    "  {\"name\":\"teamName\", \"label\":\"Team Name (Optional)\", \"type\":\"text\", \"placeholder\":\"e.g. ByteBusters\", \"required\":false}\n" +
                    "]";
            rolesSchema = "[\"organizer\", \"participant\", \"mentor\", \"judge\"]";
            dashboardSchema = "[\"total_registered\", \"confirmed\", \"checked_in\"]";
        } else if (lowerPrompt.contains("conference") || lowerPrompt.contains("summit") || lowerPrompt.contains("symposium")) {
            eventType = "CONFERENCE";
            description = "A professional conference featuring expert keynotes, panels, and networking sessions.";
            travel = false;
            carpool = false;
            regSchema = "[\n" +
                    "  {\"name\":\"companyName\", \"label\":\"Company / Institution\", \"type\":\"text\", \"placeholder\":\"e.g. Google\", \"required\":true},\n" +
                    "  {\"name\":\"designation\", \"label\":\"Designation\", \"type\":\"text\", \"placeholder\":\"e.g. Software Engineer\", \"required\":true},\n" +
                    "  {\"name\":\"dietaryPreference\", \"label\":\"Dietary Preference\", \"type\":\"select\", \"placeholder\":\"Select option\", \"required\":false, \"options\":[\"Veg\", \"Non-Veg\", \"Vegan\", \"No Preference\"]}\n" +
                    "]";
            rolesSchema = "[\"organizer\", \"participant\", \"speaker\", \"sponsor\"]";
            dashboardSchema = "[\"total_registered\", \"confirmed\", \"checked_in\", \"speakers\", \"sponsors\"]";
        } else if (lowerPrompt.contains("wedding") || lowerPrompt.contains("marriage") || lowerPrompt.contains("reunion") || lowerPrompt.contains("family")) {
            eventType = lowerPrompt.contains("wedding") ? "WEDDING" : "SOCIAL";
            description = "A celebratory gathering for family and friends.";
            regSchema = "[\n" +
                    "  {\"name\":\"relationship\", \"label\":\"Relationship / Affiliation\", \"type\":\"text\", \"placeholder\":\"e.g. Friend of Groom / Cousin\", \"required\":true},\n" +
                    "  {\"name\":\"dietaryPreference\", \"label\":\"Diet Preference\", \"type\":\"select\", \"placeholder\":\"Select option\", \"required\":true, \"options\":[\"Veg\", \"Non-Veg\", \"No Preference\"]},\n" +
                    "  {\"name\":\"accommodationNeeded\", \"label\":\"Room Accommodation Needed?\", \"type\":\"select\", \"placeholder\":\"Select option\", \"required\":true, \"options\":[\"Yes\", \"No\"]}\n" +
                    "]";
            rolesSchema = "[\"organizer\", \"guest\", \"volunteer\"]";
            dashboardSchema = "[\"total_registered\", \"confirmed\", \"maybe\", \"not_attending\", \"rooms\", \"reached_venue\"]";
        } else if (lowerPrompt.contains("alumni") || lowerPrompt.contains("meetup")) {
            eventType = "ALUMNI";
            description = "Reconnecting alumni to coordinate travel, share rides, and network.";
            regSchema = "[\n" +
                    "  {\"name\":\"batchOrGroup\", \"label\":\"Batch / Group\", \"type\":\"text\", \"placeholder\":\"e.g. Batch of 2018\", \"required\":false}\n" +
                    "]";
            rolesSchema = "[\"organizer\", \"participant\", \"driver\"]";
            dashboardSchema = "[\"total_registered\", \"confirmed\", \"maybe\", \"not_attending\", \"reached_venue\", \"en_route\", \"cars\"]";
        }

        return "{\n" +
                "  \"eventName\": \"" + escapeJson(eventName) + "\",\n" +
                "  \"eventType\": \"" + eventType + "\",\n" +
                "  \"description\": \"" + escapeJson(description) + "\",\n" +
                "  \"featuresConfig\": {\n" +
                "    \"travel\": " + travel + ",\n" +
                "    \"carpool\": " + carpool + ",\n" +
                "    \"announcements\": " + announcements + ",\n" +
                "    \"chat\": " + chat + ",\n" +
                "    \"gallery\": " + gallery + ",\n" +
                "    \"polls\": " + polls + ",\n" +
                "    \"attendance\": " + attendance + "\n" +
                "  },\n" +
                "  \"registrationSchema\": " + regSchema + ",\n" +
                "  \"rolesSchema\": " + rolesSchema + ",\n" +
                "  \"dashboardSchema\": " + dashboardSchema + "\n" +
                "}";
    }

    private String escapeJson(String rawText) {
        if (rawText == null) return "";
        return rawText.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
