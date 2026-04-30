cmake_minimum_required(VERSION 3.10)
project(AdvancedProgrammingCourse LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

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

add_executable(tests_runner
    tests/tests.cpp
    src/App.cpp
    src/CommandParser.cpp
    src/Commands.cpp
    src/ConsoleIO.cpp
    src/FileRepository.cpp
    src/SimilarityRecommender.cpp
)
target_include_directories(tests_runner PRIVATE src)

enable_testing()
add_test(NAME tests_runner COMMAND tests_runner)