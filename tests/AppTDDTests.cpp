#include <gtest/gtest.h>
#include <algorithm>
#include <cstdio>
#include <cstdlib>
#include <filesystem>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

#include "CommandParser.h"
#include "Commands.h"
#include "FileRepository.h"
#include "Interfaces.h"
#include "SimilarityRecommender.h"
#include "App.h"

// classes to simulate network input and capture output for validation.
class MockInput : public IInput {
public:
    std::vector<std::string> lines;
    size_t currentIndex = 0;

    void addLine(const std::string& line) { lines.push_back(line); }

    bool readLine(std::string& outLine) override {
        if (currentIndex < lines.size()) {
            outLine = lines[currentIndex++];
            return true;
        }
        return false;
    }
};

class MockOutput : public IOutput {
public:
    std::vector<std::string> sentMessages;
    void writeLine(const std::string& line) override {
        sentMessages.push_back(line);
    }
    
    std::string getLastMessage() const {
        return sentMessages.empty() ? "" : sentMessages.back();
    }
};

// Test Fixture to clean up the test environment
class AppTDDTest : public ::testing::Test {
protected:
    const std::string testDb = "data/tdd_test_db.txt";

    void SetUp() override {
        // Ensure the cleaning for each test
        std::filesystem::remove(testDb);
        std::filesystem::create_directories("data");
    }

    void TearDown() override {
        std::filesystem::remove(testDb);
    }
};

// Test POST command (creating a new user entry)
TEST_F(AppTDDTest, PostCommandReturns201Created) {
    FileRepository repo(testDb);
    SimilarityRecommender recommender(repo);
    MockInput input;
    MockOutput output;
    
    // Simulating input: POST <userId> <products...>
    input.addLine("POST 100 1 2 3");
    
    CommandExecutor executor(repo, recommender, output);
    App app(input, executor);
    app.run();

    // EXPECTED: "201 Created".
    // This will FAIL because the Parser doesn't recognize 'POST'.
    EXPECT_EQ(output.getLastMessage(), "201 Created");
}

// Test PATCH command (updating existing user products)
TEST_F(AppTDDTest, PatchCommandReturns204NoContent) {
    FileRepository repo(testDb);
    // Pre-seed the repository with a user
    repo.addWatched(100, {1, 2, 3});
    
    SimilarityRecommender recommender(repo);
    MockInput input;
    MockOutput output;
    
    // Simulating input: PATCH <userId> <new_products...>
    input.addLine("PATCH 100 4 5");
    
    CommandExecutor executor(repo, recommender, output);
    App app(input, executor);
    app.run();

    // EXPECTED: "204 No Content" on successful update.
    EXPECT_EQ(output.getLastMessage(), "204 No Content");
}

// Test PATCH on non-existent user
TEST_F(AppTDDTest, PatchNonExistentUserReturns404) {
    FileRepository repo(testDb);
    SimilarityRecommender recommender(repo);
    MockInput input;
    MockOutput output;
    
    input.addLine("PATCH 999 4 5"); // User 999 does not exist
    
    CommandExecutor executor(repo, recommender, output);
    App app(input, executor);
    app.run();

    // EXPECTED: "404 Not Found"
    EXPECT_EQ(output.getLastMessage(), "404 Not Found");
}

// Test GET functionality
TEST_F(AppTDDTest, GetCommandReturnsProductList) {
    FileRepository repo(testDb);
    repo.addWatched(100, {1, 2, 3});
    
    SimilarityRecommender recommender(repo);
    MockInput input;
    input.addLine("GET 100");
    MockOutput output;
    
    CommandExecutor executor(repo, recommender, output);
    App app(input, executor);
    app.run();

    // Verify format: Message 0 is status, Message 1 is data
    ASSERT_GE(output.sentMessages.size(), 2);
    EXPECT_EQ(output.sentMessages[0], "200 Ok\n");
    EXPECT_EQ(output.sentMessages[1], "1 2 3");
}

// Test DELETE functionality
TEST_F(AppTDDTest, DeleteCommandReturns204) {
    FileRepository repo(testDb);
    repo.addWatched(100, {1, 2}); // Seed user
    
    SimilarityRecommender recommender(repo);
    MockInput input;
    input.addLine("DELETE 100");
    MockOutput output;
    
    CommandExecutor executor(repo, recommender, output);
    App app(input, executor);
    app.run();

    EXPECT_EQ(output.getLastMessage(), "204 No Content");
    // Verify user is actually gone
    EXPECT_EQ(repo.getWatched(100), nullptr);
}

// Parser returns Invalid → App must call executeInvalidCommand() so the client
// sees exactly "400 Bad Request" (Ex2 wire contract / APC-96). MockOutput lets
// us assert the string without opening a real socket.
TEST_F(AppTDDTest, InvalidCommandReturns400BadRequest) {
    FileRepository repo(testDb);
    SimilarityRecommender recommender(repo);
    MockInput input;
    MockOutput output;

    input.addLine("this-is-not-a-valid-command 1 2");

    CommandExecutor executor(repo, recommender, output);
    App app(input, executor);
    app.run();

    ASSERT_FALSE(output.sentMessages.empty());
    EXPECT_EQ(output.sentMessages.back(), "400 Bad Request");
}

// Test GET/DELETE 404
TEST_F(AppTDDTest, GetAndDeleteNonExistentUserReturns404) {
    FileRepository repo(testDb);
    SimilarityRecommender recommender(repo);
    MockInput input;
    input.addLine("GET 999");
    input.addLine("DELETE 999");
    MockOutput output;
    
    CommandExecutor executor(repo, recommender, output);
    App app(input, executor);
    app.run();

    // Both should return 404
    ASSERT_GE(output.sentMessages.size(), 2);
    EXPECT_EQ(output.sentMessages[0], "404 Not Found");
    EXPECT_EQ(output.sentMessages[1], "404 Not Found");
}