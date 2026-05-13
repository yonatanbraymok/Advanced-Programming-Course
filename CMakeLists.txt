cmake_minimum_required(VERSION 3.10)
project(AdvancedProgrammingCourse LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(GTest REQUIRED)

# The main application executable
add_executable(app
    src/main.cpp
    src/App.cpp
    src/CommandParser.cpp
    src/Commands.cpp
    src/ConsoleIO.cpp
    src/FileRepository.cpp
    src/SimilarityRecommender.cpp
)
target_include_directories(app PRIVATE src)

# The test runner executable
add_executable(tests_runner
    tests/tests.cpp
    tests/AppTDDTests.cpp
    src/App.cpp
    src/CommandParser.cpp
    src/Commands.cpp
    src/ConsoleIO.cpp
    src/FileRepository.cpp
    src/SimilarityRecommender.cpp
)
target_include_directories(tests_runner PRIVATE src)

# We link against the GTest targets and pthread
target_link_libraries(tests_runner 
    GTest::gtest 
    GTest::gtest_main 
    pthread
)

enable_testing()
add_test(NAME tests_runner COMMAND tests_runner)