cmake_minimum_required(VERSION 3.10)
project(AdvancedProgrammingCourse LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_executable(app
    src/main.cpp
    # App target must include all runtime units referenced from main/App.
    src/App.cpp
    src/CommandParser.cpp
    src/FileRepository.cpp
    src/SimilarityRecommender.cpp
)
target_include_directories(app PRIVATE src)

add_executable(tests_runner
    tests/tests.cpp
    # Tests instantiate App and parse/execute flow, so link the same core units.
    src/App.cpp
    src/CommandParser.cpp
    src/FileRepository.cpp
    src/SimilarityRecommender.cpp
)
target_include_directories(tests_runner PRIVATE src)

enable_testing()
add_test(NAME tests_runner COMMAND tests_runner)
