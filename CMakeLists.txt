cmake_minimum_required(VERSION 3.14)
project(AdvancedProgrammingCourse LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# GoogleTest: use the system package when available (labs often brew-install it).
# Otherwise FetchContent downloads a pinned release so CI / fresh laptops still build.
find_package(GTest QUIET)
if(NOT GTest_FOUND)
    message(STATUS "GTest not found on system; fetching GoogleTest with FetchContent")
    include(FetchContent)
    FetchContent_Declare(
        googletest
        URL https://github.com/google/googletest/archive/refs/tags/v1.14.0.tar.gz
    )
    set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
    set(BUILD_GMOCK OFF CACHE BOOL "" FORCE)
    set(INSTALL_GTEST OFF CACHE BOOL "" FORCE)
    FetchContent_MakeAvailable(googletest)
endif()

# TCP server binary (Exercise 2): main.cpp + socket line adapters + existing core.
add_executable(app
    src/main.cpp
    src/App.cpp
    src/CommandParser.cpp
    src/Commands.cpp
    src/ConsoleIO.cpp
    src/FileRepository.cpp
    src/SimilarityRecommender.cpp
    src/ProtocolLineIO.cpp
    src/SocketLineInput.cpp
    src/SocketLineOutput.cpp
)
target_include_directories(app PRIVATE src)

# Links the same translation units as the server plus tests (SocketServerTest uses
# the real SocketLine* classes in a background thread).
add_executable(tests_runner
    tests/tests.cpp
    tests/AppTDDTests.cpp
    tests/SocketServerTest.cpp
    src/App.cpp
    src/CommandParser.cpp
    src/Commands.cpp
    src/ConsoleIO.cpp
    src/FileRepository.cpp
    src/SimilarityRecommender.cpp
    src/ProtocolLineIO.cpp
    src/SocketLineInput.cpp
    src/SocketLineOutput.cpp
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