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

namespace {

void seedAppendixUsers(FileRepository& repo) {
    repo.addWatched(1, {100, 101, 102, 103});
    repo.addWatched(2, {101, 102, 104, 105, 106});
    repo.addWatched(3, {100, 104, 105, 107, 108});
    repo.addWatched(4, {101, 105, 106, 107, 109, 110});
    repo.addWatched(5, {100, 102, 103, 105, 108, 111});
    repo.addWatched(6, {100, 103, 104, 110, 111, 112, 113});
    repo.addWatched(7, {102, 105, 106, 107, 108, 109, 110});
    repo.addWatched(8, {101, 104, 105, 106, 109, 111, 114});
    repo.addWatched(9, {100, 103, 105, 107, 112, 113, 115});
    repo.addWatched(10, {100, 102, 105, 106, 107, 109, 110, 116});
}

}  // namespace

class AppTDDTest : public ::testing::Test {
protected:
    const std::string testDb = "data/tdd_test_db.txt";

    void SetUp() override {
        std::filesystem::remove(testDb);
        std::filesystem::create_directories("data");
    }

    void TearDown() override {
        std::filesystem::remove(testDb);
    }
};

TEST_F(AppTDDTest, PostCommandReturns201Created) {
    FileRepository repo(testDb);
    SimilarityRecommender recommender(repo);
    MockInput input;
    MockOutput output;

    input.addLine("POST 100 1 2 3");

    CommandExecutor executor(repo, recommender, output);
    App app(input, executor);
    app.run();

    EXPECT_EQ(output.getLastMessage(), "201 Created");
}

TEST_F(AppTDDTest, PostDuplicateUserReturns404) {
    FileRepository repo(testDb);
    SimilarityRecommender recommender(repo);
    MockInput input;
    MockOutput output;

    input.addLine("POST 100 1 2");
    input.addLine("POST 100 3 4");

    CommandExecutor executor(repo, recommender, output);
    App app(input, executor);
    app.run();

    ASSERT_GE(output.sentMessages.size(), 2);
    EXPECT_EQ(output.sentMessages[0], "201 Created");
    EXPECT_EQ(output.sentMessages[1], "404 Not Found");
}

TEST_F(AppTDDTest, PatchCommandReturns204NoContent) {
    FileRepository repo(testDb);
    repo.addWatched(100, {1, 2, 3});

    SimilarityRecommender recommender(repo);
    MockInput input;
    MockOutput output;

    input.addLine("PATCH 100 4 5");

    CommandExecutor executor(repo, recommender, output);
    App app(input, executor);
    app.run();

    EXPECT_EQ(output.getLastMessage(), "204 No Content");
}

TEST_F(AppTDDTest, PatchNonExistentUserReturns404) {
    FileRepository repo(testDb);
    SimilarityRecommender recommender(repo);
    MockInput input;
    MockOutput output;

    input.addLine("PATCH 999 4 5");

    CommandExecutor executor(repo, recommender, output);
    App app(input, executor);
    app.run();

    EXPECT_EQ(output.getLastMessage(), "404 Not Found");
}

TEST_F(AppTDDTest, GetCommandReturnsRecommendations) {
    FileRepository repo(testDb);
    seedAppendixUsers(repo);

    SimilarityRecommender recommender(repo);
    MockInput input;
    input.addLine("GET 1 104");
    MockOutput output;

    CommandExecutor executor(repo, recommender, output);
    App app(input, executor);
    app.run();

    ASSERT_GE(output.sentMessages.size(), 2);
    EXPECT_EQ(output.sentMessages[0], "200 Ok\n");
    EXPECT_EQ(output.sentMessages[1], "105 106 111 110 112 113 107 108 109 114");
}

TEST_F(AppTDDTest, DeleteCommandReturns204AndRemovesProducts) {
    FileRepository repo(testDb);
    repo.addWatched(100, {1, 2});

    SimilarityRecommender recommender(repo);
    MockInput input;
    input.addLine("DELETE 100 1");
    MockOutput output;

    CommandExecutor executor(repo, recommender, output);
    App app(input, executor);
    app.run();

    EXPECT_EQ(output.getLastMessage(), "204 No Content");

    const auto* watched = repo.getWatched(100);
    ASSERT_NE(watched, nullptr);
    EXPECT_EQ(watched->count(1), 0);
    EXPECT_EQ(watched->count(2), 1);
}

TEST_F(AppTDDTest, DeleteUnknownProductReturns404) {
    FileRepository repo(testDb);
    repo.addWatched(100, {1, 2});

    SimilarityRecommender recommender(repo);
    MockInput input;
    input.addLine("DELETE 100 99");
    MockOutput output;

    CommandExecutor executor(repo, recommender, output);
    App app(input, executor);
    app.run();

    EXPECT_EQ(output.getLastMessage(), "404 Not Found");
}

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

TEST_F(AppTDDTest, AddAndRecommendReturn400BadRequest) {
    FileRepository repo(testDb);
    seedAppendixUsers(repo);
    SimilarityRecommender recommender(repo);
    MockInput input;
    MockOutput output;

    input.addLine("add 1 100 101");
    input.addLine("recommend 1 104");

    CommandExecutor executor(repo, recommender, output);
    App app(input, executor);
    app.run();

    ASSERT_GE(output.sentMessages.size(), 2);
    EXPECT_EQ(output.sentMessages[0], "400 Bad Request");
    EXPECT_EQ(output.sentMessages[1], "400 Bad Request");
}

TEST_F(AppTDDTest, GetAndDeleteNonExistentUserReturns404) {
    FileRepository repo(testDb);
    SimilarityRecommender recommender(repo);
    MockInput input;
    input.addLine("GET 999 1");
    input.addLine("DELETE 999 1");
    MockOutput output;

    CommandExecutor executor(repo, recommender, output);
    App app(input, executor);
    app.run();

    ASSERT_GE(output.sentMessages.size(), 2);
    EXPECT_EQ(output.sentMessages[0], "404 Not Found");
    EXPECT_EQ(output.sentMessages[1], "404 Not Found");
}
