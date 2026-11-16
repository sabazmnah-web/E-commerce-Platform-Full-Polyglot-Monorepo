// Image service: generates placeholder PNGs and resizes uploaded images.
//   GET  /health
//   GET  /placeholder?w=320&h=240
//   POST /resize?w=800&h=600     body = raw image bytes, response = PNG

#include <cstdlib>
#include <string>
#include <vector>

#include "httplib.h"

#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"

#define STB_IMAGE_RESIZE_IMPLEMENTATION
#include "stb_image_resize2.h"

#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "stb_image_write.h"

namespace {

constexpr int kMaxDimension = 4096;

int parseInt(const std::string& raw, int fallback) {
    try {
        return std::stoi(raw);
    } catch (...) {
        return fallback;
    }
}

void writeToVector(void* ctx, void* data, int size) {
    auto* out = static_cast<std::vector<unsigned char>*>(ctx);
    auto* bytes = static_cast<unsigned char*>(data);
    out->insert(out->end(), bytes, bytes + size);
}

std::vector<unsigned char> encodePng(int w, int h, int channels,
                                     const unsigned char* pixels) {
    std::vector<unsigned char> out;
    stbi_write_png_to_func(writeToVector, &out, w, h, channels, pixels, w * channels);
    return out;
}

std::vector<unsigned char> makePlaceholder(int w, int h) {
    std::vector<unsigned char> rgb(static_cast<size_t>(w) * h * 3);
    const int maxX = w > 1 ? w - 1 : 1;
    const int maxY = h > 1 ? h - 1 : 1;

    for (int y = 0; y < h; ++y) {
        for (int x = 0; x < w; ++x) {
            const size_t i = (static_cast<size_t>(y) * w + x) * 3;
            rgb[i + 0] = static_cast<unsigned char>(64 + 120 * x / maxX);
            rgb[i + 1] = static_cast<unsigned char>(96 + 90 * y / maxY);
            rgb[i + 2] = static_cast<unsigned char>(210 - 60 * x / maxX);
        }
    }
    return encodePng(w, h, 3, rgb.data());
}

}

int main() {
    httplib::Server server;

    server.set_post_routing_handler(
        [](const httplib::Request&, httplib::Response& res) {
            res.set_header("Access-Control-Allow-Origin", "*");
            res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.set_header("Access-Control-Allow-Headers", "Content-Type");
        });

    server.Options(R"(.*)", [](const httplib::Request&, httplib::Response& res) {
        res.status = 204;
    });

    server.Get("/health", [](const httplib::Request&, httplib::Response& res) {
        res.set_content(R"({"status":"ok","service":"image-service"})",
                        "application/json");
    });

    server.Get("/placeholder", [](const httplib::Request& req,
                                  httplib::Response& res) {
        const int w = parseInt(req.get_param_value("w"), 320);
        const int h = parseInt(req.get_param_value("h"), 240);

        if (w <= 0 || h <= 0 || w > kMaxDimension || h > kMaxDimension) {
            res.status = 400;
            res.set_content("invalid dimensions", "text/plain");
            return;
        }

        const auto png = makePlaceholder(w, h);
        res.set_content(reinterpret_cast<const char*>(png.data()), png.size(),
                        "image/png");
    });

    server.Post("/resize", [](const httplib::Request& req,
                              httplib::Response& res) {
        const int w = parseInt(req.get_param_value("w"), 300);
        const int h = parseInt(req.get_param_value("h"), 300);

        if (w <= 0 || h <= 0 || w > kMaxDimension || h > kMaxDimension) {
            res.status = 400;
            res.set_content("invalid dimensions", "text/plain");
            return;
        }
        if (req.body.empty()) {
            res.status = 400;
            res.set_content("empty body", "text/plain");
            return;
        }

        int srcW = 0, srcH = 0, channels = 0;
        unsigned char* src = stbi_load_from_memory(
            reinterpret_cast<const stbi_uc*>(req.body.data()),
            static_cast<int>(req.body.size()), &srcW, &srcH, &channels, 4);

        if (!src) {
            res.status = 415;
            res.set_content("unsupported image format", "text/plain");
            return;
        }

        std::vector<unsigned char> dst(static_cast<size_t>(w) * h * 4);
        stbir_resize_uint8_srgb(src, srcW, srcH, 0, dst.data(), w, h, 0,
                                STBIR_RGBA);
        stbi_image_free(src);

        const auto png = encodePng(w, h, 4, dst.data());
        res.set_content(reinterpret_cast<const char*>(png.data()), png.size(),
                        "image/png");
    });

    server.listen("0.0.0.0", 9000);
    return 0;
}
