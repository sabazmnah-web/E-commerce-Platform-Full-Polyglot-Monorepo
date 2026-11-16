cmake_minimum_required(VERSION 3.20)
project(image_service CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)

FetchContent_Declare(
  httplib
  GIT_REPOSITORY https://github.com/yhirose/cpp-httplib.git
  GIT_TAG        v0.15.3
)
FetchContent_Declare(
  stb
  GIT_REPOSITORY https://github.com/nothings/stb.git
  GIT_TAG        master
)

set(HTTPLIB_COMPILE OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(httplib stb)

add_executable(image_service src/main.cpp)
target_include_directories(image_service PRIVATE ${stb_SOURCE_DIR})
target_link_libraries(image_service PRIVATE httplib::httplib)
