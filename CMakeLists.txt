cmake_minimum_required(VERSION 3.10)
project(AdvancedProgrammingCourse LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_executable(app
    src/main.cpp
    src/SimilarityRecommender.cpp
)
target_include_directories(app PRIVATE src)

add_executable(tests_runner
    src/tests/tests.cpp
    src/SimilarityRecommender.cpp
)
target_include_directories(tests_runner PRIVATE src)
